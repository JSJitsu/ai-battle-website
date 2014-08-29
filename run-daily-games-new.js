var Q = require('q');
var secrets = require('./secrets.js');
var openDatabase = require('./helpers/open-mongo-database.js');
var completeAllGames = require('./game_logic/complete-all-games.js');
var updateLeaderboard = require('./update-leaderboard.js');
var startStopContainers = require('./docker/container_interaction/start-stop-containers.js');

//Saves all user data
var runDailyGames = function() {
  console.log('Running daily games')
  openDatabase(secrets.mongoKey).then(function(mongoData) {
    var db = mongoData.db;
    var userCollection = mongoData.userCollection;

    //Find all users
    Q.ninvoke(userCollection, 'find').then(function(response) {
      return Q.ninvoke(response, 'toArray');

    //Get all user containers ready for game
    }).then(function(users) {
      
      return completeAllGames(users, mongoData).then(function() {
        console.log('All games completed!');
        console.log('Updating leaderboard...!');
        return updateLeaderboard(users, mongoData);
      })     

    }).then(function() {
      console.log('All done!');

      console.log('Shutting down containers');
      startStopContainers.shutDownAllContainers();

      console.log('Closing database...');
      db.close();
    }).catch(function(err) {
      console.log('ERROR!');
      console.log(err);

      console.log('Shutting down containers');
      startStopContainers.shutDownAllContainers();

      console.log('Closing database...');
      db.close();
    });
  }).catch(function(err) {
    console.log('Error opening database!');
    console.log(err);
  });
};

runDailyGames();