var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var fs = require('fs');
var secrets = require('./secrets.js');
var mongoConnectionURL = secrets.mongoKey;
var createAndSaveAllGames = require('./game_logic/create-and-save-all-games.js')

var communicateWithContainers = require('./docker/container_interaction/communicate-with-containers.js');

//This script requires that all docker containers at the specified user ports are ALREADY running

//Returns a promise that resolves when the database opens
var openGameDatabase = function() {
  return Q.ninvoke(MongoClient, 'connect', mongoConnectionURL).then(function(db) {
    console.log('open!');
    return {
      db: db,
      userCollection: db.collection('users'),
      gameDataCollection: db.collection('jsBattleGameData')
    };
  });
};

//Saves all user data
var usersCodeRequest = function() {

  //Opens connection to mongo database
  var openDatabasePromise = openGameDatabase();

  openDatabasePromise.then(function(mongoData) {
    var userCollection = mongoData.userCollection;
    var db = mongoData.db;

    //Get array of all users
    userCollection.find().toArray(function(err, users) {
      if (err) {
        console.log('Error finding users!');
        console.log(err);
        db.close();
        return;
      }

      //Get the docker containers and hero brains ready to roll
      Q.all(users.map(function(user) {
        var pathToHeroBrain = secrets.rootDirectory + '/user_code/hero/' + user.githubHandle + '_hero.js';
        var pathToHelperFile = secrets.rootDirectory + '/user_code/helpers/' + user.githubHandle + '_helpers.js';
        
        //send the hero brain to the server in the container
        return communicateWithContainers.postFile(user.port, pathToHeroBrain, 'hero').then(function() {
          //send the helper file to the server in the container
          return communicateWithContainers.postFile(user.port, pathToHelperFile, 'helper');
        });

      //Start the game
      })).then(function(value) {
        console.log(value);
        console.log('All hero brain containers are ready...starting the game!');
        
        //Loop through the turns, send gameData, get responses, etc
        return createAndSaveAllGames(users, mongoData);

      }).then(function() {
        console.log('Game has finished successfully!');
        console.log('Closing database connection...');
        db.close();

      }).catch(function(err) {
        console.log('ERROR!');
        console.log(err);
        console.log('Closing db connection...');
        db.close();
      });
    });
  }).catch(function(err) {
    console.log('Error opening database!');
    console.log(err);
  });
};

usersCodeRequest();