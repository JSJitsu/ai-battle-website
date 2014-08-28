var Q = require('q');
var secrets = require('./secrets.js');
var openDatabase = require('./helpers/open-mongo-database.js');
var completeAllGames = require('./game_logic/complete-all-games.js');

// var request = require('request');
// var MongoClient = require('mongodb').MongoClient;
// var fs = require('fs');
// var secrets = require('./secrets.js');
// var mongoConnectionURL = secrets.mongoKey;
// var createAndSaveAllGames = require('./game_logic/create-and-save-all-games.js')
// var communicateWithContainers = require('./docker/container_interaction/communicate-with-containers.js');


//Saves all user data
var usersCodeRequest = function() {

  openDatabase(secrets.mongoKey).then(function(mongoData) {
    var db = mongoData.db;
    var userCollection = mongoData.userCollection;

    //Find all users
    Q.ninvoke(userCollection, 'find').then(function(response) {
      return Q.ninvoke(response, 'toArray');

    //Get all user containers ready for game
    }).then(function(users) {

      completeAllGames(users, mongoData);      

    //All user containers are 100% ready--run this game
    }).then(function() {
      console.log('All user containers are prepared!');
      console.log('Running game!')
    }).then(function() {
      console.log('All done!');
      console.log('Closing database...');
      db.close();
    }).catch(function(err) {
      console.log('ERROR!');
      console.log(err);
      console.log('Closing database...');
      db.close();
    });
  }).catch(function(err) {
    console.log('Error opening database!');
    console.log(err);
  });
};

usersCodeRequest();