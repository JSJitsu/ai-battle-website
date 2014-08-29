var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var fs = require('fs');

// generate leaderboard data and put in MongoDB as arrays
var updateLeaderboard = function(users, mongoData) {

  var userCollection = mongoData.userCollection;
  var leaderboardCollection = mongoData.leaderboardCollection;
  
  // generates an array for the leaderboard
  var getArrays = function(prop, recentLifetimeAverage) {
    var leaderboardArray = [];
    for (var i = 0; i < users.length; i++) {
      if (recentLifetimeAverage === 'averageStats') {
        // create leaderboardArray object for averageStats
        leaderboardArray[i] = {};
        leaderboardArray[i].name =  users[i].githubHandle;
        // generate totalgames by adding the users wins and losses
        var totalGames = users[i]['lifetimeStats']['wins'] +
                           users[i]['lifetimeStats']['losses'];
        // generate an average value up to two decimal places
        leaderboardArray[i].value = (Number(parseFloat(users[i]['lifetimeStats'][prop] / 
                                      totalGames).toFixed(2)) || 0);
        // do not want an undefined property showing up in our leaderboard array
      } else if (users[i][recentLifetimeAverage][prop] !== undefined) {
        // we cannot refactor these two lines outside the for loop
        // because we do not want an object instantiated when value is undefined
        leaderboardArray[i] = {};
        leaderboardArray[i].name =  users[i].githubHandle;
        leaderboardArray[i].value = users[i][recentLifetimeAverage][prop];  
      } 
    } 

    // sort the array of stats from greatest to lowest
    leaderboardArray.sort(function(a, b) {
      return b.value - a.value;
    });

    // take the 10 highest values for our leaderboard
    leaderboardArray = leaderboardArray.slice(0, 10);

    // if using an average stat we need to append 'per game' for display
    if (recentLifetimeAverage === 'averageStats') {
      for(var j = 0; j < leaderboardArray.length; j++) {
        leaderboardArray[j].value = leaderboardArray[j].value + ' per game';
      }
    }

    return leaderboardArray;
  };

  // generate the 29 arrays for our leaderboard categories
  var killsRecent = getArrays('kills', 'mostRecentStats');
  var killsLifetime = getArrays('kills', 'lifetimeStats');
  var killsAverage = getArrays('kills', 'averageStats');
  var damageDealtRecent = getArrays('damageDealt', 'mostRecentStats');
  var damageDealtLifetime = getArrays('damageDealt', 'lifetimeStats');
  var damageDealtAverage = getArrays('damageDealt', 'averageStats');
  var minesCapturedRecent = getArrays('minesCaptured', 'mostRecentStats');
  var minesCapturedLifetime = getArrays('minesCaptured', 'lifetimeStats');
  var minesCapturedAverage = getArrays('minesCaptured', 'averageStats');
  var diamondsEarnedRecent = getArrays('diamondsEarned', 'mostRecentStats');
  var diamondsEarnedLifetime = getArrays('diamondsEarned', 'lifetimeStats');
  var diamondsEarnedAverage = getArrays('diamondsEarned', 'averageStats');
  var healthRecoveredRecent = getArrays('healthRecovered', 'mostRecentStats');
  var healthRecoveredLifetime = getArrays('healthRecovered', 'lifetimeStats');
  var healthRecoveredAverage = getArrays('healthRecovered', 'averageStats');
  var winsLifetime = getArrays('wins', 'lifetimeStats');
  var winsAverage = getArrays('wins', 'averageStats');
  var gravesRobbedRecent = getArrays('gravesRobbed', 'mostRecentStats');
  var gravesRobbedLifetime = getArrays('gravesRobbed', 'lifetimeStats');
  var gravesRobbedAverage = getArrays('gravesRobbed', 'averageStats');
  var healthGivenRecent = getArrays('healthGiven', 'mostRecentStats');
  var healthGivenLifetime = getArrays('healthGiven', 'lifetimeStats');
  var healthGivenAverage = getArrays('healthGiven', 'averageStats');
  var deathsRecent = getArrays('deaths', 'mostRecentStats');
  var deathsLifetime = getArrays('deaths', 'lifetimeStats');
  var deathsAverage = getArrays('deaths', 'averageStats');
  var lossesRecent = getArrays('losses', 'mostRecentStats');
  var lossesLifetime = getArrays('losses', 'lifetimeStats');
  var lossesAverage = getArrays('losses', 'averageStats');

  // prepare our stat arrays for upload to MongoDB
  var statsTuples = [['recent|kills', killsRecent],
                     ['lifetime|kills', killsLifetime],
                     ['average|kills', killsAverage],
                     ['recent|damageDealt', damageDealtRecent],
                     ['lifetime|damageDealt', damageDealtLifetime],
                     ['average|damageDealt', damageDealtAverage],
                     ['recent|minesCaptured', minesCapturedRecent],
                     ['lifetime|minesCaptured', minesCapturedLifetime],
                     ['average|minesCaptured', minesCapturedAverage],
                     ['recent|diamondsEarned', diamondsEarnedRecent],
                     ['lifetime|diamondsEarned', diamondsEarnedLifetime],
                     ['average|diamondsEarned', diamondsEarnedAverage],
                     ['recent|healthRecovered', healthRecoveredRecent],
                     ['lifetime|healthRecovered', healthRecoveredLifetime],
                     ['average|healthRecovered', healthRecoveredAverage],
                     ['lifetime|wins', winsLifetime],
                     ['average|wins', winsAverage],
                     ['recent|gravesRobbed', gravesRobbedRecent],
                     ['lifetime|gravesRobbed', gravesRobbedLifetime],
                     ['average|gravesRobbed', gravesRobbedAverage],
                     ['recent|healthGiven', healthGivenRecent],
                     ['lifetime|healthGiven', healthGivenLifetime],
                     ['average|healthGiven', healthGivenAverage],
                     ['recent|deaths', deathsRecent],
                     ['lifetime|deaths', deathsLifetime],
                     ['average|deaths', deathsAverage],
                     ['recent|losses', lossesRecent],
                     ['lifetime|losses', lossesLifetime],
                     ['average|losses', lossesAverage]];

  // generate a promise from a post of a leader array
  var generateUpdate = function(statsTuple) {
    return Q.npost(leaderboardCollection, 'update', [
      // query document to update
      {
        '_id': statsTuple[0]
      },                 
      // update document with the new array generated
      {
        '_id': statsTuple[0],
        'topUsers': statsTuple[1]
      },                             
      // upsert will update a document or create a new one
      { 
        upsert: true 
      }
    ]);
  };

  var generateUpdatePromises = [];

  // generate an array of promises for each leaderboard top ten array
  for (var j = 0; j < statsTuples.length; j++) {
    generateUpdatePromises.push(generateUpdate(statsTuples[j]));
  }
  // pass the array of promises in to Q.all
  return Q.all(generateUpdatePromises).then(function() {
    console.log('leaderboardCollection updated');
  // error handling
  }).catch(function(error) {
    console.error("Error in writing leaderboard data to database: ", error);
  });
};

module.exports = updateLeaderboard;