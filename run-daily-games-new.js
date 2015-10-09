var Q = require('q');
Q.longStackSupport = true;
var secrets = require('./secrets.js');
var SafeMongoConnection = require('./helpers/safe-mongo-connection.js');
var completeAllGames = require('./game_logic/complete-all-games.js');
var updateLeaderboard = require('./stats/update-leaderboard.js');

var mongoOptions = {
  server: {
    socketOptions: {
      keepAlive: 1,
      connectTimeoutMS: 30000
    },
    auto_reconnect: true
  },
  replset: {
    socketOptions: {
      keepAlive: 1,
      connectTimeoutMS: 30000
    }
  }
};

// Run and save all games and all user stats
var runDailyGames = function() {
  console.log('Running daily games')

  // Connect to mongo database
  var mongoConnection = new SafeMongoConnection(secrets.mongoKey, mongoOptions);
  mongoConnection.connect()

  .then(function() {
    // Get all users
    return mongoConnection.safeInvoke('users', 'find')

    .then(function(response) {
      return Q.ninvoke(response, 'toArray');
    })

    .then(function(users) {

      // Run all the games, then update the leaderboard
      return completeAllGames(users, mongoConnection)

      .then(function() {
        console.log('All games completed!');
        console.log('Updating leaderboard...');
        return updateLeaderboard(users, mongoConnection);
      })

      .then(function() {
        console.log('Leaderboard updated successfully!');
      });

    })

    // Clean up after everything finishes (regardless of errors)
    .finally(function() {
      console.log('Closing database connection before the script ends.');
      return mongoConnection.disconnect()

      .then(function() {
        console.log('Database closed successfully.');
      });

    });
  })

  .done(
    function() {
      console.log('Script completed successfully!');
    },
    function(err) {
      console.log('There was an uncaught error in the script:');
      throw err;
    }
  );
};

runDailyGames();