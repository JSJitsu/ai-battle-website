var Q = require('q');
var openGameDatabase = require('../helpers/open-mongo-database.js');

var assignUsersToGames = function() {

  //Opens connection to mongo database
  return openGameDatabase().then(function(mongoDataObject) {
    var userCollection = mongoDataObject.userCollection;
    var miscCollection = mongoDataObject.miscCollection;
    var db = mongoDataObject.db;
    var gameQueue = {};

    //Get array of users from database
    return Q.ninvoke(userCollection, 'find', {}).then(function(response) {
      return Q.ninvoke(response, 'toArray');
    }).then(function(users) {

      //Maximum # of users per team?
      var maxUsersPerTeam = 12;

      //Calculate number of games necessary
      var numberOfGames = Math.ceil(users.length / maxUsersPerTeam / 2);

      //Used to make sure heroes get added evenly to teams
      var alternateTeams = [];
      gameQueue.numberOfGames = numberOfGames;
      gameQueue.gamesToPlay = [];
      for (var gameIndex=0; gameIndex<numberOfGames; gameIndex++) {
        alternateTeams.push(0);
        gameQueue.gamesToPlay[gameIndex] = {
          status: 'Not Started'
        };
      }

      var userUpdatePromises = [];
      var currentGameIndex = -1;

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
        if (currentGameIndex < numberOfGames - 1) {
          currentGameIndex++;
        } else {
          currentGameIndex = 0;
        }

        //Get a random user from the user list
        var nextUserIndex = Math.floor(Math.random(Date.now()) * users.length);
        var user = users.splice(nextUserIndex, 1)[0];

        //Save the user (be able to get the hero port, etc later)
        user.assignedTeam = team;
        user.assignedGame = currentGameIndex;

        console.log('Assigning user: ' + user.githubHandle + ' to game ' + currentGameIndex + ' on team ' + team);

        var userPromise = Q.npost(userCollection, 'update', [
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
      console.log('Saving game queue to misc database');

      gameQueue._id = 'gameQueue';
      var gameQueuePromise = Q.npost(miscCollection, 'update', [
        {
          '_id': 'gameQueue'
        }, gameQueue, {
          upsert: true
        }
      ]);

    }).then(function() {
      console.log('Game Queue saved successfully!')
      console.log('Closing database...');
      db.close();
    }).catch(function(err) {
      console.log('Error while assigning users to games!');
      console.log(err);
      console.log('Closing database...');
      db.close();
    });
  });
};

assignUsersToGames();