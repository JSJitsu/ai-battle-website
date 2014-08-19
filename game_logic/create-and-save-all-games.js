var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var Game = require('./game_classes/Game.js');
var secrets = require('../secrets.js');
var communicateWithContainers = require('../docker/container_interaction/communicate-with-containers.js');
var createGameFromMap = require('./create-game-from-map.js');
var saveUserStats = require('./save-user-stats.js')

var createAndSaveAllGames = function(users, mongoData) {
  var infoObject = setUpAllGames(users);
  var games = infoObject.games;
  var userLookup = infoObject.userLookup;
  return runAndSaveAllGames(mongoData, games, userLookup);
}

//Synchronous, returns an array of all games that need
//to be run
var setUpAllGames = function(users) {

  console.log('Users: ' + users.length);

  //Helper function for generating random indices
  var randomIndex = function(maxExcl) {
    return Math.floor(Math.random() * maxExcl);
  };

  //Set up game
  var boardSize = 12;

  //Maximum # of users per team?
  var maxUsersPerTeam = 12;

  //Used to look up hero port numbers
  var userLookup = {};

  //Stores all the game objects
  var games = [];

  //Calculate number of games needed
  var numberOfGames = Math.ceil(users.length / maxUsersPerTeam / 2);

  var alternateTeams = [];

  //Create games
  for (var gameIndex=0; gameIndex<numberOfGames; gameIndex++) {
    var game = createGameFromMap(secrets.rootDirectory + 
        '/game_logic/maps/' + secrets.map + '.txt');
    game.maxTurn = 1250;
    games.push(game);

    //Keeps track of which team to add the
    //next hero to for each game
    //(Used below)
    alternateTeams.push(0);
  }

  //Add users to each game (one user to first game,
  //then move to next game and add a user, and so on
  //until all users have been added)
  var currentGameIndex = 0;
  while (users.length > 0) {
    var game = games[currentGameIndex];
    var team = alternateTeams[currentGameIndex];

    //Next hero added to this game will be on the other team
    if (team === 0) {
      alternateTeams[currentGameIndex] = 1;
    } else {
      alternateTeams[currentGameIndex] = 0;
    }

    //Loops through each game
    if (currentGameIndex < games.length - 1) {
      currentGameIndex++;
    } else {
      currentGameIndex = 0;
    }

    //Get a random user from the user list
    var nextUserIndex = randomIndex(users.length);
    var user = users.splice(nextUserIndex, 1)[0];

    //Save the user (be able to get the hero port, etc later)
    userLookup[user.githubHandle] = user;

    console.log('Adding user: ' + user.githubHandle + ' to game ' + currentGameIndex + ', team ' + team);

    //Put hero at random location in the current game
    while (!game.addHero(randomIndex(boardSize), randomIndex(boardSize), user.githubHandle, team)) {
      //Keep looping until the hero is successfully added
      //(Since we are choosing random locations, heroes that are added
      // onto occupied squares do nothing and return false, hence the loop)
    }
  }
  return {
    games: games,
    userLookup: userLookup
  };
};

//Runs and saves all games and returns a promise
var runAndSaveAllGames = function(mongoData, games, userLookup) {
  var gamePromises = games.map(function(game, gameIndex) {
    return runGamePromise(mongoData, game, gameIndex, userLookup);
  });
  return Q.all(gamePromises);
};

var runGamePromise = function(mongoData, game, gameIndex, userLookup) {

  //The collection we're inserting into
  var mongoCollection = mongoData.gameDataCollection;

  //The database we're inserting into
  var mongoDb = mongoData.db;

  //Get date string for use in game ID (helpful saving uniquely to mongo db)
  var getDateString = function() {
    var dayOffset = secrets.dayOffset;
    var d = new Date((new Date()).getTime() + dayOffset*24*60*60*1000);
    var result = (d.getMonth() + 1).toString();
    result += '/' + d.getDate();
    result += '/' + d.getFullYear();
    return result;
  };

  //Loops through the entire game, saves each turn to the database
  var resolveGameAndSaveTurnsToDB = function(game) {
    //Get today's date in string form
    var date = getDateString();
    game.date = date;

    //Manually set the ID so Mongo doesn't just keep writing to the same document
    game._id = gameIndex.toString() + '|' + game.turn.toString() + '|' + date;


    //Save the game to the database
    return Q.npost(mongoCollection, 'update', [
      {
        '_id':game._id
      }, game, {
        upsert:true
      }

    //Then get the next direction the activeHero wants to move
    ]).then(function(result) {

      //Get the current hero
      var activeHero = game.activeHero;

      console.log('Turn is: ' + game.turn);

      //Get the direction the currently active hero wants to move
      var port = userLookup[activeHero.name].port;
      console.log('Port is: ' + port);

      console.log('User is: ' + activeHero.name);

      return communicateWithContainers.postGameData(port, game)

    //Then move the active hero in that direction
    }).then(function(direction) {

      console.log('Direction is: ' + direction);

      //If game has ended, stop looping and set the max turn
      if (game.ended) {
        maxTurn = game.maxTurn;
        return game;

      //Otherwise, continue with next turn and save that turn
      } else {
        //Advances the game one turn
        game.handleHeroTurn(direction);

        //Manually set the ID so Mongo doesn't just keep writing to the same document
        game._id = game.turn + '|' + game.date;

        return resolveGameAndSaveTurnsToDB(game);
      }
    }).catch(function(err) {
      console.trace();
      console.log('---------')
      console.log(err);
      throw err;
    });
  };

  //Runs the game and saves the result to DB
  var saveGameData = resolveGameAndSaveTurnsToDB(game);

  //Updates the game turn objects to have the correct maxTurn
  //This is necessary for the front end to know the total # of turns
  return saveGameData.then(function(game) {
    console.log('Game done, updating maxTurn for each turn...');
    console.log(game.maxTurn);
    return Q.npost(mongoCollection, 'update', [
      {
        date: game.date
      },
      {
        $set: {
          maxTurn: game.maxTurn
        }
      },
      {
        multi: true
      }
    ]).then(function() {
      console.log('Game turns updated!');
      console.log('Updating all user stats...');
      return Q.all(game.heroes.map(function(hero) {
        return saveUserStats(mongoData, hero);
      }));
    });
  });
}

module.exports = createAndSaveAllGames;