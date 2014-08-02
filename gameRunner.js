var mongodb = require('mongodb');
var Q = require('q');
var Game = require('./Game.js');
var move = require('./hero.js');

var server = new mongodb.Server('localhost', 27017, {});
var db = new mongodb.Db('javascriptBattle', server);

var openGameDatabase = function() {
  return Q.ninvoke(db, 'open').then(function(result) {
    console.log('open!');
    return Q.ninvoke(db, 'createCollection', 'gameData');
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
  result += '/' + d.getDay();
  result += '/' + d.getFullYear();
  return result;
};

var runGame = function() {
  var game = new Game();
  game.addHero(3,0);
  game.addHero(0,3);

  var date = getDateString();
  var openDatabasePromise = openGameDatabase();
  game._id = game.turn + '|' + date;


  //Open mongo connection
  openDatabasePromise.then(function(collection) {
    //Store 1st turn
    var addGameDataPromise = addGameDataToDatabase(collection, game, date);

    //Store all remaining turns
    for (var i=0; i<10; i++) {
      addGameDataPromise = addGameDataPromise.then(function() {
        console.log('Added turn: ' + game.turn);
        
        game.handleHeroTurn(move(game));
        game._id = game.turn + '|' + date;

        return addGameDataToDatabase(collection, game, date);
      });
    }
  }).catch(function(err) {
    console.log(err);
  });
};

runGame();