var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var fs = require('fs');
var secrets = require('./secrets.js');
var mongoConnectionURL = secrets.mongoKey;
var createAndSaveAllGames = require('./game_logic/create-and-save-all-games.js')

//Returns a promise that resolves when the database opens
var openGameDatabase = function() {
  return Q.ninvoke(MongoClient, 'connect', mongoConnectionURL).then(function(db) {
    console.log('open!');
    return {
      db: db,
      userCollection: db.collection('users'),
      leaderboardCollection: db.collection('leaderboard')
    };
  });
};

var updateLeaderboard = function() {

  //Opens connection to mongo database
  var openDatabasePromise = openGameDatabase();

  openDatabasePromise.then(function(mongoData) {
    var userCollection = mongoData.userCollection;
    var leaderboardCollection = mongoData.leaderboardCollection;
    var db = mongoData.db;

    //Get array of all users
    userCollection.find().toArray(function(err, users) {
      if (err) {
        console.log('Error finding users!');
        console.log(err);
        db.close();
        return;
      }

    var getArrays = function(prop, recentOrLifetime) {
      var leaderboardArray = [];
      for (var i = 0; i < users.length; i++) {
        if (users[i][recentOrLifetime][prop] !== undefined) {
          leaderboardArray[i] = {};
          leaderboardArray[i].Name =  users[i].githubHandle;
          leaderboardArray[i][prop] = users[i][recentOrLifetime][prop];
        }
      } 
      leaderboardArray.sort(function(a, b){
        return b[prop] - a[prop];
      });
      leaderboardArray = leaderboardArray.slice(0, 10);
      return leaderboardArray;
    };

    var killsRecent = getArrays('kills', 'mostRecentStats');
    var killsLifetime = getArrays('kills', 'lifetimeStats');
    var damageDealtRecent = getArrays('damageDealt', 'mostRecentStats');
    var damageDealtLifetime = getArrays('damageDealt', 'lifetimeStats');
    var minesCapturedRecent = getArrays('minesCaptured', 'mostRecentStats');
    var minesCapturedLifetime = getArrays('minesCaptured', 'lifetimeStats');
    var diamondsEarnedRecent = getArrays('diamondsEarned', 'mostRecentStats');
    var diamondsEarnedLifetime = getArrays('diamondsEarned', 'lifetimeStats');
    var healthRecoveredRecent = getArrays('healthRecovered', 'mostRecentStats');
    var healthRecoveredLifetime = getArrays('healthRecovered', 'lifetimeStats');
    var winsLifetime = getArrays('wins', 'lifetimeStats');
    var gravesRobbedRecent = getArrays('gravesRobbed', 'mostRecentStats');
    var gravesRobbedLifetime = getArrays('gravesRobbed', 'lifetimeStats');


      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'killsRecent'
        },                 
        {
          '_id': 'killsRecent',
          'killsRecent': killsRecent
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'killsLifetime'
          },                 
          {
            '_id': 'killsLifetime',
            'killsLifetime': killsLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'damageDealtRecent'
          },                 
          {
            '_id': 'damageDealtRecent',
            'damageDealtRecent': damageDealtRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'damageDealtLifetime'
          },                 
          {
            '_id': 'damageDealtLifetime',
            'damageDealtLifetime': damageDealtLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'minesCapturedRecent'
          },                 
          {
            '_id': 'minesCapturedRecent',
            'minesCapturedRecent': minesCapturedRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'minesCapturedLifetime'
          },                 
          {
            '_id': 'minesCapturedLifetime',
            'minesCapturedLifetime': minesCapturedLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'diamondsEarnedRecent'
          },                 
          {
            '_id': 'diamondsEarnedRecent',
            'diamondsEarnedRecent': diamondsEarnedRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'diamondsEarnedLifetime'
          },                 
          {
            '_id': 'diamondsEarnedLifetime',
            'diamondsEarnedLifetime': diamondsEarnedLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'healthRecoveredRecent'
          },                 
          {
            '_id': 'healthRecoveredRecent',
            'healthRecoveredRecent': healthRecoveredRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'healthRecoveredLifetime'
          },                 
          {
            '_id': 'healthRecoveredLifetime',
            'healthRecoveredLifetime': healthRecoveredLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'winsLifetime'
          },                 
          {
            '_id': 'winsLifetime',
            'winsLifetime': winsLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'gravesRobbedRecent'
          },                 
          {
            '_id': 'gravesRobbedRecent',
            'gravesRobbedRecent': gravesRobbedRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'gravesRobbedLifetime'
          },                 
          {
            '_id': 'gravesRobbedLifetime',
            'gravesRobbedLifetime': gravesRobbedLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          db.close();
      }).catch(function(error) {
        console.error("Error in writing leaderboard data to database: ", error);
      });
    });
  });
};

updateLeaderboard();
