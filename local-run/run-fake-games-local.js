var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var Game = require('./game_logic/game_classes/Game.js');
var secrets = require('./secrets.js');

var mongoConnectionURL = 'mongodb://localhost/javascriptBattle';

var openGameDatabase = function() {
  return Q.ninvoke(MongoClient, 'connect', mongoConnectionURL).then(function(db) {
    console.log('open!');
    return {
      collection: db.collection('jsBattleGameData'),
      db: db
    };
  });
};

var addGameDataToDatabase = function(collection, gameData, date) {
  gameData.date = date;
  return Q.ninvoke(collection, 'insert', gameData).then(function(docs) {
    console.log('~~~~~~');
    console.log(docs);
    console.log('~~~~~~');
  }, function(err) {
    console.log(err);
  });
};

var getDateString = function() {
  var d = new Date();
  var result = (d.getMonth() + 1).toString();
  result += '/' + d.getDate();
  result += '/' + d.getFullYear();
  return result;
};

var runGame = function() {
  //Set up the game board

  var randomNumber = function(max) {
    return Math.floor(Math.random()*max);
  };

  var boardSize = 12;
  var game = new Game(boardSize);

  for (var i=0; i<12; i++) {
    while (!game.addHero(randomNumber(boardSize), randomNumber(boardSize), 'random', 0)) {
      //Loops until each hero is successfully added
    }
  }

  for (var i=0; i<12; i++) {
    while (!game.addHero(randomNumber(boardSize), randomNumber(boardSize), 'random', 1)) {
      //Loops until each hero is successfully added
    }
  }
  for (var i=0; i<6; i++) {
    game.addHealthWell(randomNumber(boardSize), randomNumber(boardSize));
  }
  for (var i=0; i<18; i++) {
    game.addImpassable(randomNumber(boardSize), randomNumber(boardSize));
  }
  for (var i=0; i<12; i++) {
    game.addDiamondMine(randomNumber(boardSize), randomNumber(boardSize));
  }

  var maxTurn = 2000;
  game.maxTurn = maxTurn;

  //Get today's date in string form
  var date = getDateString();
  game.date = date;

  //Manually set the ID so Mongo doesn't just keep writing to the same document
  game._id = '0' + '|' + game.turn + '|' + date;

  //Open up the database connection
  var openDatabasePromise = openGameDatabase();

  //After opening the database promise, 
  openDatabasePromise.then(function(mongoData) {
    //The collection we're inserting into
    var mongoCollection = mongoData.collection;
    //The database we're inserting into
    var mongoDb = mongoData.db;

    var resolveGameAndSaveTurnsToDB = function(game) {
      console.log('Turn: ' + game.turn);

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

        //Get the direction the currently active hero wants to move
        var choices = ['North', 'South', 'East', 'West'];
        return choices[Math.floor(Math.random()*4)];

      //Then move the active hero in that direction
      }).then(function(direction) {

        //If game has ended, stop looping and set the max turn
        if (game.ended) {
          maxTurn = game.maxTurn;

        //Otherwise, continue with next turn and save that turn
        } else {
          //Advances the game one turn
          game.handleHeroTurn(direction);

          //Manually set the ID so Mongo doesn't just keep writing to the same document
          game._id = '0' + '|' + game.turn + '|' + game.date;

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
    return saveGameData.then(function() {
      console.log('Game done, updating maxTurn for each turn...');
      console.log(game.maxTurn);
      Q.npost(mongoCollection, 'update', [
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
        console.log('Turns updated!');
        console.log('All tasks complete, closing DB connection')
        mongoDb.close();
      });
    });
  }).catch(function(err) {
    mongoDb.close();
    console.trace();
    console.log('---------')
    console.log(err);
    throw err;
  });
};

runGame();