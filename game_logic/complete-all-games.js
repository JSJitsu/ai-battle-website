var planAllGames = require('./plan-all-games.js');
var saveUserStats = require('../stats/save-user-stats.js');
var secrets = require('../secrets.js');
var fs = require('fs');
var vm = require('vm');

var gamesCompleted = 0;

var completeAllGames = function(users, mongoConnection) {

  var plannedGames = planAllGames(users);
  var games = plannedGames.games;
  var userLookup = plannedGames.userLookup;

  return prepRunAndSaveAllGames(mongoConnection, games, 0, userLookup);
}

//Runs and saves all games and returns a promise
var prepRunAndSaveAllGames = function(mongoConnection, games, gameIndex, userLookup) {
  console.log(gamesCompleted + ' games completed. ' +
              games.length + ' games left to play!');

  var game = games.shift(games);

  //Run and save the first game in the queue
  return prepRunAndSaveGame(mongoConnection, game, gameIndex, userLookup)

  //Loop recursively until the games array is empty
  //Can't use Q.all because the games need to be run sequentially (b/c we can only
  //start up a finite # of docker containers at a time)
  .then(function() {
    if (games.length > 0) {
      return prepRunAndSaveAllGames(mongoConnection, games, gameIndex + 1, userLookup);
    }
  });
};

var prepRunAndSaveGame = function(mongoConnection, game, gameIndex, userLookup) {
  return runAndSaveGame(mongoConnection, game, gameIndex, userLookup)
  // Update each game turn to have the correct "maxTurn"
  // attribute (after the max turn for the game is known)
  .then(function() {
    gamesCompleted++;
    return updateMaxGameTurn(mongoConnection, game);
  });

};

var runAndSaveGame = function(mongoConnection, game, gameIndex, userLookup) {

  // Get date string for use in game ID
  // (Helpful on front-end for easily finding games)
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
    game.date = getDateString();

    //Manually set the ID so Mongo doesn't just keep writing to the same document
    game.baseId = gameIndex.toString() + '|' + game.date;
    game._id = game.baseId + '|' + game.turn.toString();

    //Save the number of the game
    game.gameNumber = gameIndex;

    //Save the game to the database
    return mongoConnection.safeInvoke(
      'jsBattleGameData',
      'update',
      {
        '_id':game._id
      },
      game,
      {
        upsert:true
      }
    )

    //Then get the next direction the activeHero wants to move
    .then(function(result) {

      //Get the current hero
      var activeHero = game.activeHero;

      //Get the direction the currently active hero wants to move
      console.log('Turn: ' + game.turn + ', User: ' + activeHero.name);

      return runHeroBrain(game, userLookup[activeHero.name]);
    })

    //Then move the active hero in that direction
    .then(function(direction) {

      console.log('Direction is: ' + direction);

      //If game has ended, stop looping and set the max turn
      if (game.ended) {
        return game;

      //Otherwise, continue with next turn and save that turn
      } else {
        //Advances the game one turn
        game.handleHeroTurn(direction);

        return resolveGameAndSaveTurnsToDB(game);
      }
    })
  };

  //Runs the game and saves the result to DB
  console.log('Running and saving game ' + gameIndex);

  return resolveGameAndSaveTurnsToDB(game);
}

var runHeroBrain = function (game, user) {
  var rootPath = __dirname + '/../user_code',
      heroFilePath = rootPath + '/hero/' + user.githubHandle + '_hero.js',
      helperFilePath = rootPath + '/helpers/' + user.githubHandle + '_helpers.js',
      heroFile,
      helperFile,
      script,
      result,
      sandbox,
      vmOptions,
      safeGameData;

  heroFile = fs.readFileSync(heroFilePath, 'utf8');
  helperFile = fs.readFileSync(helperFilePath, 'utf8');

  safeGameData = JSON.parse(JSON.stringify(game));

  try {
    // Anything that goes into the sandbox MUST BE a copy so that the hero AI
    // is unable to cause trouble in the rest of the application.
    sandbox = {
      gameData: safeGameData,
      helpers: require(helperFilePath),
      move: require(heroFilePath)
    };

    vmOptions = {
      displayErrors: true,
      filename: user.githubHandle,
      timeout: 3000
    };

    vm.runInNewContext('moveResult=move(gameData, helpers)', sandbox, vmOptions);

    // Anything coming out of the sandbox MUST BE sanitized.
    result = sandbox.moveResult;

    if (result !== undefined) {
      result = result.toString();
    }
  } catch (e) {
    console.error(e);
  }

  return result;
};

var updateMaxGameTurn = function(mongoConnection, game) {
  //Updates the game turn objects to have the correct maxTurn
  //This is necessary for the front end to know the total # of turns
  console.log('Updating maxTurn to ' + game.maxTurn +
    ' for all turns in game number ' + game.gameNumber);

  return mongoConnection.safeInvoke(
    'jsBattleGameData',
    'update',
    {
      date: game.date,
      gameNumber: game.gameNumber
    },
    {
      $set: {
        maxTurn: game.maxTurn
      }
    },
    {
      multi: true
    }
  )

  .then(function() {
    console.log('Game turns updated successfully!');
    console.log('Updating all user stats...');

    // Save each hero's stats for the most recent game
    // Loop recursively until complete, return a promise
    var saveStatsForNextHero = function() {
      var hero = heroesToSave.pop();

      return saveUserStats(mongoConnection, hero, game.baseId)

      .then(function() {
        if (heroesToSave.length > 0) {
          return saveStatsForNextHero();
        }
      });
    };

    var heroesToSave = game.heroes.slice();

    return saveStatsForNextHero()
    .then(function() {
      console.log('All user stats updated for game #' + game.gameNumber);
    });
  });
};


module.exports = completeAllGames;