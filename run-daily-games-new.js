var openDatabase = require('./helpers/open-mongo-database.js');
var prepareUserContainers = require('./docker/prepare-user-containers.js');


// var request = require('request');
// var MongoClient = require('mongodb').MongoClient;
// var Q = require('q');
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
    var gameDataCollection = mongoData.gameDataCollection;

    //Find all users
    return Q.ninvoke(userCollection, 'find').then(function(response) {
      return Q.ninvoke(response, 'toArray');

    //Get all user containers ready for game
    }).then(function(users) {

      console.log('Preparing users...');

      //Get the users for the first game
      return prepareUserContainers(users);
      

    //All user containers are 100% ready--run this game
    }).then(function() {

      console.log('All users prepared!');

    }).catch(function(err) {
      console.log('ERROR!');
      console.log(err);
    });
};

usersCodeRequest();