var createGameFromMap = require('./create-game-from-map.js');
var secrets = require('../secrets.js');

//Synchronous, returns an array of all games that need
//to be run and a lookup for finding user info
var planAllGames = function(users) {

  console.log('Planning games for ' + users.length + ' users.');

  //Makes it so the passed-in users array is not mutated
  var users = users.slice()

  //Helper function for generating random indices
  var randomIndex = function(maxExcl) {
    return Math.floor(Math.random(Date.now()) * maxExcl);
  };

  //Set up game
  var boardSize = 12;

  //Maximum # of users per team?
  var maxUsersPerTeam = 7;

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
    game.maxTurn = 750;
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

    //Get a random user from the user list
    var nextUserIndex = randomIndex(users.length);
    var user = users.splice(nextUserIndex, 1)[0];

    //Save the user (be able to get the hero port, etc later)
    userLookup[user.githubHandle] = user;

    console.log('Adding user: ' + user.githubHandle + ' to game ' + currentGameIndex + ', team ' + team);

    //Loops through each game
    if (currentGameIndex < games.length - 1) {
      currentGameIndex++;
    } else {
      currentGameIndex = 0;
    }

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

module.exports = planAllGames;