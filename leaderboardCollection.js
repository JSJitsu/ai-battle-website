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
          leaderboardArray[i].name =  users[i].githubHandle;
          leaderboardArray[i].value = users[i][recentOrLifetime][prop];
        }
      } 
      leaderboardArray.sort(function(a, b){
        return b.value - a.value;
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
    var healthGivenRecent = getArrays('healthGiven', 'mostRecentStats');
    var healthGivenLifetime = getArrays('healthGiven', 'lifetimeStats');
    var deathsRecent = getArrays('deaths', 'mostRecentStats');
    var deathsLifetime = getArrays('deaths', 'lifetimeStats');
    var lossesRecent = getArrays('losses', 'mostRecentStats');
    var lossesLifetime = getArrays('losses', 'lifetimeStats');

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'recent|kills'
        },                 
        {
          '_id': 'recent|kills',
          'topUsers': killsRecent
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'lifetime|kills'
          },                 
          {
            '_id': 'lifetime|kills',
            'topUsers': killsLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'recent|damageDealt'
          },                 
          {
            '_id': 'recent|damageDealt',
            'topUsers': damageDealtRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'lifetime|damageDealt'
          },                 
          {
            '_id': 'lifetime|damageDealt',
            'topUsers': damageDealtLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'recent|minesCaptured'
          },                 
          {
            '_id': 'recent|minesCaptured',
            'topUsers': minesCapturedRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'lifetime|minesCaptured'
          },                 
          {
            '_id': 'lifetime|minesCaptured',
            'topUsers': minesCapturedLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'recent|diamondsEarned'
          },                 
          {
            '_id': 'recent|diamondsEarned',
            'topUsers': diamondsEarnedRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'lifetime|diamondsEarned'
          },                 
          {
            '_id': 'lifetime|diamondsEarned',
            'topUsers': diamondsEarnedLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'recent|healthRecovered'
          },                 
          {
            '_id': 'recent|healthRecovered',
            'topUsers': healthRecoveredRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'lifetime|healthRecovered'
          },                 
          {
            '_id': 'lifetime|healthRecovered',
            'topUsers': healthRecoveredLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'lifetime|wins'
          },                 
          {
            '_id': 'lifetime|wins',
            'topUsers': winsLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'recent|gravesRobbed'
          },                 
          {
            '_id': 'recent|gravesRobbed',
            'topUsers': gravesRobbedRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'lifetime|gravesRobbed'
          },                 
          {
            '_id': 'lifetime|gravesRobbed',
            'topUsers': gravesRobbedLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'recent|healthGiven'
          },                 
          {
            '_id': 'recent|healthGiven',
            'topUsers': healthGivenRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'lifetime|healthGiven'
          },                 
          {
            '_id': 'lifetime|healthGiven',
            'topUsers': healthGivenLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'recent|deaths'
          },                 
          {
            '_id': 'recent|deaths',
            'topUsers': deathsRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'lifetime|deaths'
          },                 
          {
            '_id': 'lifetime|deaths',
            'topUsers': deathsLifetime
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'recent|losses'
          },                 
          {
            '_id': 'recent|losses',
            'topUsers': lossesRecent
          },                             
          { 
            upsert: true 
          }
        ]);
      }).then(function() {
          return Q.npost(leaderboardCollection, 'update', [
          {
            '_id': 'lifetime|losses'
          },                 
          {
            '_id': 'lifetime|losses',
            'topUsers': lossesLifetime
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
