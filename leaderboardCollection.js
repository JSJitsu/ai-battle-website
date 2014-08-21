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

    var statsTuples = [['recent|kills', killsRecent],
                       ['lifetime|kills', killsLifetime],
                       ['recent|damageDealt', damageDealtRecent],
                       ['lifetime|damageDealt', damageDealtLifetime],
                       ['recent|minesCaptured', minesCapturedRecent],
                       ['lifetime|minesCaptured', minesCapturedLifetime],
                       ['recent|diamondsEarned', diamondsEarnedRecent],
                       ['lifetime|diamondsEarned', diamondsEarnedLifetime],
                       ['recent|healthRecovered', healthRecoveredRecent],
                       ['lifetime|healthRecovered', healthRecoveredLifetime],
                       ['lifetime|wins', winsLifetime],
                       ['recent|gravesRobbed', gravesRobbedRecent],
                       ['lifetime|gravesRobbed', gravesRobbedLifetime],
                       ['recent|healthGiven', healthGivenRecent],
                       ['lifetime|healthGiven', healthGivenLifetime],
                       ['recent|deaths', deathsRecent],
                       ['lifetime|deaths', deathsLifetime],
                       ['recent|losses', lossesRecent],
                       ['lifetime|losses', lossesLifetime]];

    var generateUpdate = function(statsTuple) {
      return Q.npost(leaderboardCollection, 'update', [
        {
          '_id': statsTuple[0]
        },                 
        {
          '_id': statsTuple[0],
          'topUsers': statsTuple[1]
        },                             
        { 
          upsert: true 
        }
      ])
    };

    var generateUpdatePromises = [];

    for (var j = 0; j < statsTuples.length; j++) {
      generateUpdatePromises.push(generateUpdate(statsTuples[j]));
    
    }
    Q.all(generateUpdatePromises)
      .then(function() {
          console.log('leaderboardCollection updated');
          db.close();
      }).catch(function(error) {
        console.error("Error in writing leaderboard data to database: ", error);
      });
    });
  });
};

updateLeaderboard();
