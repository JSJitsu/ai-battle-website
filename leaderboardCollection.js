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

var updateLeaderboardKillsRecent = function() {

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
      var leaderboardKillsRecentArray = [];

      for (var i = 0; i < users.length; i++) {
        // recentKills document
        if (users[i].mostRecentStats.kills !== undefined) {
          leaderboardKillsRecentArray.push({Name: users[i].githubHandle, kills: users[i].mostRecentStats.kills});
        }

      } 

      leaderboardKillsRecentArray.sort(function(a, b){
        return b.kills - a.kills;
      });

      leaderboardKillsRecentArray = leaderboardKillsRecentArray.slice(0, 10);
      console.log('leaderBoardKillsRecentArray: ', leaderboardKillsRecentArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'recentKillsLeaderboard'
        },                 
        {
          '_id': 'recentKillLeaderboard',
          'recentKillsArray': leaderboardKillsRecentArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database1');
        db.close();
      });
    });
  });
};

var updateLeaderboardKillsLifetime = function() {

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
      var leaderboardLifetimeKillsArray = [];

      for (var i = 0; i < users.length; i++) {
        // recentKills document
        leaderboardLifetimeKillsArray.push({Name: users[i].githubHandle, kills: users[i].lifetimeStats.kills});
      } 

      leaderboardLifetimeKillsArray.sort(function(a, b){
        return b.kills - a.kills;
      });

      leaderboardLifetimeKillsArray = leaderboardLifetimeKillsArray.slice(0, 10);
      console.log('leaderBoardLifetimeKillsArray: ', leaderboardLifetimeKillsArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'lifetimeKillsLeaderboard'
        },                 
        {
          '_id': 'lifetimeKillsLeaderboard',
          'lifetimeKillsArray': leaderboardLifetimeKillsArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database2');
        db.close();
      });
    });
  });
};

var updateLeaderboardDamagedealtRecent = function() {

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
      var leaderboardDamagedealtRecentArray = [];

      for (var i = 0; i < users.length; i++) {
        if (users[i].mostRecentStats.kills !== undefined) {
          leaderboardDamagedealtRecentArray.push({Name: users[i].githubHandle, damageDealt: users[i].mostRecentStats.damageDealt});
        }
      } 

      leaderboardDamagedealtRecentArray.sort(function(a, b){
        return b.damageDealt - a.damageDealt;
      });

      leaderboardDamagedealtRecentArray = leaderboardDamagedealtRecentArray.slice(0, 10);
      console.log('leaderBoardDamagedealtRecentArray: ', leaderboardDamagedealtRecentArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'recentDamagedealtLeaderboard'
        },                 
        {
          '_id': 'recentDamagedealtLeaderboard',
          'recentDamagedealtArray': leaderboardDamagedealtRecentArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database3');
        db.close();
      });
    });
  });
};

var updateLeaderboardDamagedealtLifetime = function() {

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
      var leaderboardDamagedealtLifetimeArray = [];

      for (var i = 0; i < users.length; i++) {
        // recentKills document
        leaderboardDamagedealtLifetimeArray.push({Name: users[i].githubHandle, damageDealt: users[i].lifetimeStats.damageDealt});
      } 

      leaderboardDamagedealtLifetimeArray.sort(function(a, b){
        return b.damageDealt - a.damageDealt;
      });

      leaderboardDamagedealtLifetimeArray = leaderboardDamagedealtLifetimeArray.slice(0, 10);
      console.log('leaderBoardDamagedealtLifetimeArray: ', leaderboardDamagedealtLifetimeArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'lifetimeDamagedealtLeaderboard'
        },                 
        {
          '_id': 'lifetimeDamagedealtLeaderboard',
          'lifetimeDamagedealtArray': leaderboardDamagedealtLifetimeArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database4');
        db.close();
      });
    });
  });
};

var updateLeaderboardMinesCapturedRecent = function() {

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
      var leaderboardMinesCapturedRecentArray = [];

      for (var i = 0; i < users.length; i++) {
      
        if (users[i].mostRecentStats.kills !== undefined) {
          leaderboardMinesCapturedRecentArray.push({Name: users[i].githubHandle, minesCaptured: users[i].mostRecentStats.minesCaptured});
        }
      } 

      leaderboardMinesCapturedRecentArray.sort(function(a, b){
        return b.minesCaptured - a.minesCaptured;
      });

      leaderboardMinesCapturedRecentArray = leaderboardMinesCapturedRecentArray.slice(0, 10);
      console.log('leaderBoardMinesCapturedRecentArray: ', leaderboardMinesCapturedRecentArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'recentMinesCapturedRecentLeaderboard'
        },                 
        {
          '_id': 'recentMinesCapturedRecentLeaderboard',
          'recentMinesCapturedArray': leaderboardMinesCapturedRecentArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database5');
        db.close();
      });
    });
  });
};

var updateLeaderboardMinesCapturedLifetime = function() {

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
      var leaderboardMinesCapturedLifetimeArray = [];

      for (var i = 0; i < users.length; i++) {
        // recentKills document
        leaderboardMinesCapturedLifetimeArray.push({Name: users[i].githubHandle, minesCaptured: users[i].lifetimeStats.minesCaptured});
      } 

      leaderboardMinesCapturedLifetimeArray.sort(function(a, b){
        return b.minesCaptured - a.minesCaptured;
      });

      leaderboardMinesCapturedLifetimeArray = leaderboardMinesCapturedLifetimeArray.slice(0, 10);
      console.log('leaderBoardMinesCapturedLifetimeArray: ', leaderboardMinesCapturedLifetimeArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'lifetimeMinesCapturedLeaderboard'
        },                 
        {
          '_id': 'lifetimeMinesCapturedLeaderboard',
          'lifetimeMinesCapturedArray': leaderboardMinesCapturedLifetimeArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database6');
        db.close();
      });
    });
  });
};

var updateLeaderboardDiamondsEarnedRecent = function() {

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
      var leaderboardDiamondsEarnedRecentArray = [];

      for (var i = 0; i < users.length; i++) {
        if (users[i].mostRecentStats.kills !== undefined) {
          leaderboardDiamondsEarnedRecentArray.push({Name: users[i].githubHandle, diamondsEarned: users[i].mostRecentStats.diamondsEarned});
        }
      } 

      leaderboardDiamondsEarnedRecentArray.sort(function(a, b){
        return b.diamondsEarned - a.diamondsEarned;
      });
      

      leaderboardDiamondsEarnedRecentArray = leaderboardDiamondsEarnedRecentArray.slice(0, 10);
      console.log('leaderBoardDiamondsEarnedRecentArray: ', leaderboardDiamondsEarnedRecentArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'recentDiamondsEarnedLeaderboard'
        },                 
        {
          '_id': 'recentDiamondsEarnedLeaderboard',
          'recentDiamondsEarnedArray': leaderboardDiamondsEarnedRecentArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database7');
        db.close();
      });
    });
  });
};


var updateLeaderboardDiamondsEarnedLifetime = function() {

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
      var leaderboardDiamondsEarnedLifetimeArray = [];

      for (var i = 0; i < users.length; i++) {
        // recentKills document
        leaderboardDiamondsEarnedLifetimeArray.push({Name: users[i].githubHandle, diamondsEarned: users[i].lifetimeStats.diamondsEarned});
      } 

      leaderboardDiamondsEarnedLifetimeArray.sort(function(a, b){
        return b.diamondsEarned - a.diamondsEarned;
      });

      leaderboardDiamondsEarnedLifetimeArray = leaderboardDiamondsEarnedLifetimeArray.slice(0, 10);
      console.log('leaderBoardDiamondsEarnedLifetimeArray: ', leaderboardDiamondsEarnedLifetimeArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'lifetimeDiamondsEarnedLeaderboard'
        },                 
        {
          '_id': 'lifetimeDiamondsEarnedLeaderboard',
          'lifetimeDiamondsEarnedArray': leaderboardDiamondsEarnedLifetimeArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database8');
        db.close();
      });
    });
  });
};


var updateLeaderboardHealthRecoveredRecent = function() {

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
      var leaderboardHealthRecoveredRecentArray = [];

      for (var i = 0; i < users.length; i++) {
        if (users[i].mostRecentStats.kills !== undefined) {
          leaderboardHealthRecoveredRecentArray.push({Name: users[i].githubHandle, healthRecovered: users[i].mostRecentStats.healthRecovered});
        }
      } 

      leaderboardHealthRecoveredRecentArray.sort(function(a, b){
        return b.healthRecovered - a.healthRecovered;
      });

      leaderboardHealthRecoveredRecentArray = leaderboardHealthRecoveredRecentArray.slice(0, 10);
      console.log('leaderBoardHealthRecoveredRecentArray: ', leaderboardHealthRecoveredRecentArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'recentHealthRecoveredLeaderboard'
        },                 
        {
          '_id': 'recentHealthRecoveredLeaderboard',
          'recentHealthRecoveredArray': leaderboardHealthRecoveredRecentArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database9');
        db.close();
      });
    });
  });
};


var updateLeaderboardHealthRecoveredLifetime = function() {

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
      var leaderboardHealthRecoveredLifetimeArray = [];

      for (var i = 0; i < users.length; i++) {
        // recenthealthRecovered document
        leaderboardHealthRecoveredLifetimeArray.push({Name: users[i].githubHandle, healthRecovered: users[i].lifetimeStats.healthRecovered});
      } 

      leaderboardHealthRecoveredLifetimeArray.sort(function(a, b){
        return b.healthRecovered - a.healthRecovered;
      });

      leaderboardHealthRecoveredLifetimeArray = leaderboardHealthRecoveredLifetimeArray.slice(0, 10);
      console.log('leaderBoardHealthRecoveredLifetimeArray: ', leaderboardHealthRecoveredLifetimeArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'lifetimeHealthRecoveredLeaderboard'
        },                 
        {
          '_id': 'lifetimeHealthRecoveredLeaderboard',
          'lifetimeHealthRecoveredArray': leaderboardHealthRecoveredLifetimeArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database10');
        db.close();
      });
    });
  });
};


var updateLeaderboardWinsLifetime = function() {

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
      var leaderboardWinsLifetimeArray = [];

      for (var i = 0; i < users.length; i++) {
        // recentKills document
        leaderboardWinsLifetimeArray.push({Name: users[i].githubHandle, wins: users[i].lifetimeStats.wins});
      } 

      leaderboardWinsLifetimeArray.sort(function(a, b){
        return b.wins - a.wins;
      });

      leaderboardWinsLifetimeArray = leaderboardWinsLifetimeArray.slice(0, 10);
      console.log('leaderBoardWinsLifetimeArray: ', leaderboardWinsLifetimeArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'lifetimeWinsLeaderboard'
        },                 
        {
          '_id': 'lifetimeWinsLeaderboard',
          'lifetimeWinsArray': leaderboardWinsLifetimeArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database11');
        db.close();
      });
    });
  });
};


var updateLeaderboardGravesRobbedRecent = function() {

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
      var leaderboardGravesRobbedRecentArray = [];

      for (var i = 0; i < users.length; i++) {
        if (users[i].mostRecentStats.kills !== undefined) {
          leaderboardGravesRobbedRecentArray.push({Name: users[i].githubHandle, gravesRobbed: users[i].mostRecentStats.gravesRobbed});
        }
      } 

      leaderboardGravesRobbedRecentArray.sort(function(a, b){
        return b.gravesRobbed - a.gravesRobbed;
      });

      leaderboardGravesRobbedRecentArray = leaderboardGravesRobbedRecentArray.slice(0, 10);
      console.log('leaderBoardGravesRobbedRecentArray: ', leaderboardGravesRobbedRecentArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'recentGravesRobbedLeaderboard'
        },                 
        {
          '_id': 'recentGravesRobbedLeaderboard',
          'recentKillsArray': leaderboardGravesRobbedRecentArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database12');
        db.close();
      });
    });
  });
};


var updateLeaderboardGravesRobbedLifetime = function() {

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
      var leaderboardGravesRobbedLifetimeArray = [];

      for (var i = 0; i < users.length; i++) {
        // recentKills document
        leaderboardGravesRobbedLifetimeArray.push({Name: users[i].githubHandle, gravesRobbed: users[i].lifetimeStats.gravesRobbed});
      } 

      leaderboardGravesRobbedLifetimeArray.sort(function(a, b){
        return b.gravesRobbed - a.gravesRobbed;
      });

      leaderboardGravesRobbedLifetimeArray = leaderboardGravesRobbedLifetimeArray.slice(0, 10);
      console.log('leaderBoardGravesRobbedLifetimeArray: ', leaderboardGravesRobbedLifetimeArray);

      Q.npost(leaderboardCollection, 'update', [
        {
          '_id': 'lifetimeGravesRobbedLeaderboard'
        },                 
        {
          '_id': 'lifetimeGravesRobbedLeaderboard',
          'lifetimeGravesRobbedArray': leaderboardGravesRobbedLifetimeArray
        },                             
        { 
          upsert: true 
        }
      ]).then(function() {
        console.log('close database13');
        db.close();
      });
    });
  });
};

updateLeaderboardKillsRecent();
updateLeaderboardKillsLifetime();
updateLeaderboardDamagedealtRecent();
updateLeaderboardDamagedealtLifetime();
updateLeaderboardMinesCapturedRecent();
updateLeaderboardMinesCapturedLifetime();
updateLeaderboardDiamondsEarnedRecent();
updateLeaderboardDiamondsEarnedLifetime();
updateLeaderboardHealthRecoveredRecent();
updateLeaderboardHealthRecoveredLifetime();
updateLeaderboardWinsLifetime();
updateLeaderboardGravesRobbedRecent();
updateLeaderboardGravesRobbedLifetime();