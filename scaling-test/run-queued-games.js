var Q = require('q');
var secrets = require('../secrets.js');
var createAndSaveGame = require('./create-and-save-game.js');
var openGameDatabase = require('../helpers/open-mongo-database.js');
var communicateWithContainers = require('./docker/container_interaction/communicate-with-containers.js');

openGameDatabase().then(function(mongoDataObject) {
  var userCollection = mongoDataObject.userCollection;
  var miscCollection = mongoDataObject.miscCollection;
  var gameDataCollection = mongoDataObject.gameDataCollection;
  var db = mongoDataObject.db;

  return Q.ninvoke(miscCollection, 'findOne', { '_id': 'gameQueue' }).then(function(gameQueue) {
    var gameRunPromises = [];
    for (var i=0; i<gameQueue.numberOfGames; i++) {
      var game = gameQueue.gamesToPlay[i];

      if (game.status === 'Containers Started') {
        //This game needs to be run (and is ready)
        var gameRunPromise = runGame(i, mongoDataObject).then(function() {
          game.status = 'Completed';

          //After the game is run, save it as being "completed"
          return Q.npost(miscCollection, 'update', [
            {
              '_id': gameQueue._id
            }, gameQueue, {
              upsert: true
            }
          ]).then(function() {
            console.log('Game completed and updated in the game queue');
          });
        });

        //Add promise to array
        gameRunPromises.push(gameRunPromise);

      } else if (game.status === 'Completed') {
        //This game has already been fully completed
        //skip it
      } else if (game.status === 'Not Started') {
        //Containers for this and all remaining games have not yet been started
        //Stop the loop here
        break;
      }
    }
  });

});


var usersCodeRequest = function() {

  //Opens connection to mongo database
  var openDatabasePromise = openGameDatabase();

  openDatabasePromise.then(function(mongoData) {
    var userCollection = mongoData.userCollection;
    var db = mongoData.db;

    //Get array of all users that have assigned ports
    userCollection.find({ 
      port: {
        $gt: 12499
      }
    }).toArray(function(err, users) {
      if (err) {
        console.log('Error finding users!');
        console.log(err);
        db.close();
        return;
      }

      //Get the docker containers and hero brains ready to roll
      Q.all(users.map(function(user) {
        var pathToHeroBrain = secrets.rootDirectory + '/user_code/hero/' + user.githubHandle + '_hero.js';
        var pathToHelperFile = secrets.rootDirectory + '/user_code/helpers/' + user.githubHandle + '_helpers.js';
        
        //send the hero brain to the server in the container
        return communicateWithContainers.postFile(user.port, pathToHeroBrain, 'hero').then(function() {
          //send the helper file to the server in the container
          return communicateWithContainers.postFile(user.port, pathToHelperFile, 'helper');
        });

      //Start the game
      })).then(function(value) {
        console.log(value);
        console.log('All hero brain containers are ready...starting the game!');
        
        //Loop through the turns, send gameData, get responses, etc
        return createAndSaveAllGames(users, mongoData);

      }).then(function() {
        console.log('Game has finished successfully!');
        console.log('Closing database connection...');
        db.close();

      }).catch(function(err) {
        console.log('ERROR!');
        console.log(err);
        console.log('Closing db connection...');
        db.close();
      });
    });
  }).catch(function(err) {
    console.log('Error opening database!');
    console.log(err);
  });
};

usersCodeRequest();