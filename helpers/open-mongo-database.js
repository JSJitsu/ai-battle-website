var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var secrets = require('../secrets.js');
var defaultConnectionURL = secrets.mongoKey;

//Returns a promise that opens the mongo database
var openDatabase = function(mongoConnectionURL) {
  mongoConnectionURL = mongoConnectionURL || defaultConnectionURL;

  return Q.ninvoke(MongoClient, 'connect', mongoConnectionURL).then(function(db) {
    console.log('Mongo database is connected!');
    return {
      db: db,
      gameDataCollection: db.collection('jsBattleGameData'),
      userCollection: db.collection('users'),
      miscCollection: db.collection('misc')
    };
  }, function(err) {
    console.log('Error opening database!');
    console.log(err);
  });
};

module.exports = openDatabase;