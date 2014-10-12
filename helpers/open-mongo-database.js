var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var secrets = require('../secrets.js');
var defaultConnectionURL = secrets.mongoKey;

var mongoOptions = {
  server: {
    socketOptions: {
      keepAlive: 1,
      connectTimeoutMS: 30000
    }
  },
  replset: {
    socketOptions: {
      keepAlive: 1,
      connectTimeoutMS: 30000
    }
  }
};

//Returns a promise that opens the mongo database
var openDatabase = function(mongoConnectionURL) {
  mongoConnectionURL = mongoConnectionURL || defaultConnectionURL;

  return Q.ninvoke(MongoClient, 'connect', mongoConnectionURL, mongoOptions).then(function(db) {
    console.log('Mongo database is connected!');
    return {
      db: db,
      gameDataCollection: db.collection('jsBattleGameData'),
      userCollection: db.collection('users'),
      miscCollection: db.collection('misc'),
      leaderboardCollection: db.collection('leaderboard')
    };
  }, function(err) {
    console.log('Error opening database!');
    console.log(err);
  });
};

module.exports = openDatabase;
