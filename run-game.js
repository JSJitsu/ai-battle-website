var request = require('./node_modules/request');
var MongoClient = require('./node_modules/mongodb').MongoClient;
var Q = require('./node_modules/q');
var fs = require('fs');
var secrets = require('./secrets.js');
var mongoConnectionURL = secrets.mongoKey;
var containerSpinupPromise = require('./docker/container-spin-up.js');

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

  openDatabasePromise.then(function(mongoDataObject) {
    var userCollection = mongoDataObject.userCollection;
    var db = mongoDataObject.db;

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

        //spin up a container at that port
        return containerSpinupPromise(user.port).then(function() {
          //return sendthembrain
          //send them the hero brain
        });

      //Start the game
      })).then(function() {
        console.log('All hero brain containers are ready...starting the game!');
        //Start the game
          //Loop through the turns, send gameData, get responses, etc
      }).then(function() {
        console.log('Game has finished successfully!');
        console.log('Closing database connection...');
        db.close();
      }).catch(function(err) {
        console.log('ERROR!');
        console.log(err);
        return;
      });
    });
  }).catch(function(err) {
    console.log('Error opening database!');
    console.log(err);
  });
};

usersCodeRequest();


//Loop through the array of users
  //assign a port to each
  //spin up a container at that port
  //send them the hero brain



//Profit