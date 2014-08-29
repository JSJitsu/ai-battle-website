//This file is meant to be run many times per day after all users have been
//assigned to games at the start of the day

var Q = require('q');
var openGameDatabase = require('../helpers/open-mongo-database.js');
var startStopContainers = require('../docker/container_interaction/start-stop-containers.js');

var GAMES_AT_ONCE = 3;
var port = 12500;


var startContainersForUsersInGame = function(userCollection, gameNumber) {
  //Grab all users in this game
  return Q.ninvoke(userCollection, 'find', { assignedGame: gameNumber }).then(function(response) {
    return Q.ninvoke(response, 'toArray');
  }).then(function(users) {
    var userContainerPromises = [];
    
    //Start up containers for all those users
    for (var i=0; i<users.length; i++) {
      var user = users[i];
      user.port = port;
      
      var userContainerPromise = startStopContainers.spinUpContainer(port).then(function() {

        console.log('Saving port for user: ' + user.githubHandle);

        //Save ports on the user object
        return Q.npost(userCollection, 'update', [
          {
            '_id': user._id
          }, user, {
            upsert: true
          }
        ]).then(function() {
          console.log('Port saved!');
        });

      });

      userContainerPromises.push(userContainerPromise);
      port++;
    }

    //Resolves when all user containers start up
    return Q.all(userContainerPromises).then();

  });
};

//Pull game status object from database
openGameDatabase().then(function(mongoDataObject) {
  var db = mongoDataObject.db;
  var miscCollection = mongoDataObject.miscCollection;
  var userCollection = mongoDataObject.userCollection;

  return Q.ninvoke(miscCollection, 'findOne', { '_id': 'gameQueue' }).then(function(gameQueue) {
    var gamesRemaining = GAMES_AT_ONCE;
    var gamePrepPromises = [];

    //We always run the games in order--set up the user containers
    //for the next GAMES_AT_ONCE games here
    for (var i=0; i<gameQueue.numberOfGames; i++) {
      var game = gameQueue.gamesToPlay[i];

      if (gamesRemaining <= 0) {
        //We're at our max games at the moment
        return Q.all(gamePrepPromises).then(function() {
          console.log('Started all containers for users in the next set of games...');
          
          console.log('Saving this progress to the gameQueue object in the database...');
          //Save new game status to database
          return Q.npost(miscCollection, 'update', [
            {
              '_id': 'gameQueue'
            }, gameQueue, {
              upsert: true
            }
          ]).then(function() {
            console.log('Progress saved to gameQueue object!');
          });
        });

      } else if (game.status === 'Containers Started') {
        //The last game has not completed yet
        throw 'Last games have not yet completed!';
      } else if (game.status === 'Completed') {
        //This game has already been fully completed
        //skip it
      } else if (game.status === 'Not Started') {
        //This game needs to be run

        //Updates the status of the game (doesn't save to database unless it all completes)
        game.status = 'Containers Started';

        console.log('Starting user containers for game #' + i);
        gamePrepPromises.push(startContainersForUsersInGame(userCollection, i));
        gamesRemaining--;
      }
    }
  }).then(function() {
    console.log('Closing database!');
    db.close();
  }).catch(function(err) {
    console.log('Error starting user containers for the next group of games!');
    console.log(err);

    console.log('Closing database!');
    db.close();

    // console.log('Shutting down all containers due to error');
    // startStopContainers.shutDownAllContainers().then(function() {
    //   console.log('Containers shut down successfully');
    // });
  });
});




