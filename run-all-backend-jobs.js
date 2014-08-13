var request = require('./node_modules/request');
var MongoClient = require('./node_modules/mongodb').MongoClient;
var Q = require('./node_modules/q');
var fs = require('fs');
var secrets = require('./secrets.js');
var mongoConnectionURL = secrets.mongoKey;
var containerFunctions = require('./docker/container-functions.js');
var createAndSaveAllGames = require('./game-runner.js')

var postToServerFunctions = require('./docker/post-to-server-functions.js');

//Returns a promise that resolves when the database opens
var openGameDatabase = function() {
  return Q.ninvoke(MongoClient, 'connect', mongoConnectionURL).then(function(db) {
    console.log('open!');
    return {
      db: db,
      userCollection: db.collection('users')
    };
  });
};

//Saves all user data
var usersCodeRequest = function () {

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

      //The starting port
      var port = 12499;

      //Get the docker containers and hero brains ready to roll
      Q.all(users.map(function(user) {
        //assign a port to each
        port++;
        user.port = port;

        //spin up a container at that port (returns a promise)
        return containerFunctions.spinUpContainer(user.port).then(function() {
          var pathToHeroBrain = secrets.rootDirectory + '/user_code/' + user.githubHandle + '_hero.js';
          var pathToHelperFile = secrets.rootDirectory + '/user_code/' + user.githubHandle + '_helpers.js';

          //send the hero brain to the server
          return postToServerFunctions.postFile(user.port, pathToHeroBrain, 'hero').then(function() {
            //send the helper file to the server
            return postToServerFunctions.postFile(user.port, pathToHelperFile, 'helper');
          });

        });
      //Start the game
      })).then(function() {
        console.log('All hero brain containers are ready...starting the game!');
        
        //Loop through the turns, send gameData, get responses, etc
        return createAndSaveAllGames(users, mongoData);

      }).then(function() {
        console.log('Game has finished successfully!');
        console.log('Closing database connection...');
        db.close();
        
        console.log('Stopping and removing all containers...');
        return containerFunctions.shutDownAllContainers();

      }).catch(function(err) {
        console.log('ERROR!');
        console.log(err);
        console.log('Shutting down all containers!');
        containerFunctions.shutDownAllContainers().then(function() {
          db.close();
        }).catch(function(err) {
          console.log(err);
          db.close();
        });
      });
    });
  }).catch(function(err) {
    console.log('Error opening database!');
    console.log(err);
  });
};

usersCodeRequest();