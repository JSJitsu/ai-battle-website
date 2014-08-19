var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var secrets = require('../secrets.js');
var mongoConnectionURL = secrets.mongoKey;

var startStopContainers = require('./container_interaction/start-stop-containers.js');

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

      //The starting port
      var port = 12499;

      //Get the docker containers and hero brains ready to roll
      console.log('Killing all containers to start...');
      startStopContainers.shutDownAllContainers().then(function() {
        console.log('All containers stopped...');
      }, function() {
        console.log('All containers were already stopped...');
      }).then(function() {
        console.log('Restarting all containers...');

        return Q.all(users.map(function(user) {
          //assign a port to each
          port++;
          user.port = port;

          //spin up a container at that port (returns a promise)
          return startStopContainers.spinUpContainer(user.port).then(function() {
            //Save the user port
            return Q.npost(mongoData.userCollection, 'update', [
              {
                '_id': user._id
              }, user, {
                upsert: true
              }
            ]);
          });
        }));
      }).then(function() {
        console.log('All containers started, closing database');
        db.close();
      }).catch(function(err) {
        console.log('ERROR!');
        console.log(err);
        db.close();
      });
    });
  }).catch(function(err) {
    console.log('Error opening database!');
    console.log(err);
  });
};

usersCodeRequest();