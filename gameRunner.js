var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var Game = require('./Game.js');

var mongoConnectionURL = process.env.CUSTOMCONNSTR_MONGO_URI || 'mongodb://localhost/javascriptBattle'
// var mongoConnectionURL = 'mongodb://localhost/javascriptBattle';

var move = function(gameData, helpers) {
  var choices = ['North', 'East', 'South', 'West'];
  return choices[Math.floor(Math.random()*4)];
};

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
  var game = new Game();
  game.addHero(0,0);
  game.addHero(0,4);
  game.addHero(4,0);
  game.addHero(4,4);

  game.addHealthWell(2,2);
  
  game.addImpassable(2,1);
  game.addImpassable(2,3);

  game.addDiamondMine(0,2);
  game.addDiamondMine(2,0);
  game.addDiamondMine(4,2);
  game.addDiamondMine(2,4);

  //Get today's date in string form
  var date = getDateString();

  //Manually set the ID so Mongo doesn't just keep writing to the same document
  game._id = game.turn + '|' + date;


  //Open up the database connection
  var openDatabasePromise = openGameDatabase();

  //After opening the database promise, 
  openDatabasePromise.then(function(mongoData) {
    //The collection we're inserting into
    var mongoCollection = mongoData.collection;
    //The database we're inserting into
    var mongoDb = mongoData.db;

    var resolveGameAndSaveTurnsToDB = function(game) {
      console.log(game.turn);
      mongoCollection.update({
        '_id':game._id
      }, game, {
        upsert:true
      }, function(err, result) {
        if (err) {
          console.trace();
          console.log('---------')
          console.log(err);
        }

        if (game.ended) {
          console.log('closed!')
          mongoDb.close();
          return;
        }

        game.handleHeroTurn(move(game));

        //Manually set the ID so Mongo doesn't just keep writing to the same document
        game._id = game.turn + '|' + date;

        resolveGameAndSaveTurnsToDB(game);
      });
    };

    resolveGameAndSaveTurnsToDB(game);

  }).catch(function(err) {
    console.trace();
    console.log('---------')
    console.log(err);
  });
};

runGame();