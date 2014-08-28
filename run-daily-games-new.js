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

      //Get the users for the first game

      

    //All user containers are 100% ready--run this game
    }).then(function(users) {

    })

    //Get array of all users that have assigned ports
    userCollection.find({ 
      port: {
        $gt: 12499
      }
    }).toArray(function(err, users) {
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