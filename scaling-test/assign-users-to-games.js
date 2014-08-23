var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var fs = require('fs');
var secrets = require('../secrets.js');
var mongoConnectionURL = secrets.mongoKey;

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

var assignUsersToGames = function() {

  //Opens connection to mongo database
  openGameDatabase().then(function(mongoDataObject) {
    var userCollection = mongoDataObject.userCollection;
    var db = mongoDataObject.db;

    Q.ninvoke(userCollection, 'find', {}).then(function(response) {
      return Q.ninvoke(response, 'toArray');
    }).then(function(users) {

      //Maximum # of users per team?
      var maxUsersPerTeam = 12;

      //Calculate number of games necessary
      var numberOfGames = Math.ceil(users.length / maxUsersPerTeam / 2);

      //Used to make sure heroes get added evenly to teams
      var alternateTeams = [];
      for (var gameIndex=0; gameIndex<numberOfGames; gameIndex++) {
        alternateTeams.push(0);
      }

      var userUpdatePromises = [];
      var currentGameIndex = 0;

      //Assign users to games and teams
      while (users.length > 0) {
        var team = alternateTeams[currentGameIndex];

        //Next hero added to this game will be assigned to the other team
        if (team === 0) {
          alternateTeams[currentGameIndex] = 1;
        } else {
          alternateTeams[currentGameIndex] = 0;
        }

        //Loops through each game
        if (currentGameIndex < games.length - 1) {
          currentGameIndex++;
        } else {
          currentGameIndex = 0;
        }

        //Get a random user from the user list
        var nextUserIndex = Math.floor(Math.random() * users.length);
        var user = users.splice(nextUserIndex, 1)[0];

        //Save the user (be able to get the hero port, etc later)
        user.team = team;
        user.assignedGame = currentGameIndex;

        console.log('Assigning user: ' + user.githubHandle + ' to game ' + currentGameIndex + 'on team ' + team);

        var userPromise = Q.npost(mongoCollection, 'update', [
          {
            '_id':user._id
          }, user, {
            upsert: true
          }
        ]);
        userUpdatePromises.push(userPromise);
      }

      return Q.all(userUpdatePromises);

    }).then(function() {
      console.log('Assigning users to games was successful!');
      console.log('Closing database...');
      db.close();
    }).catch(function(err) {
      console.log('Error while assigning users to games!');
      console.log(err);
      console.log('Closing database...');
      db.close();
    });


  }).catch(function(err) {
    console.log('Error opening database!');
    console.log(err);
  });

};

assignUsersToGames();