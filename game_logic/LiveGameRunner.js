var Q = require('q');
var GameRunner = require('./GameRunner.js');
var MongoClient = require('mongodb').MongoClient;
var secrets = require('../secrets.js');
var updateLeaderboardFn = require('../stats/update-leaderboard.js');

Q.longStackSupport = true;

function LiveGameRunner () {

  var self = this,
      database,
      userRecords;

  this.openDatabase = function () {
    return Q.nfcall(MongoClient.connect, secrets.mongoKey)
      .then(function (db) {
        database = db;
        self.database = db;
      });
  };

  this.getUserRecords = function () {
    var userCollection = database.collection('users');

    userRecords = userCollection.find();

    return Q.ninvoke(userRecords, 'toArray');
  };

  this.runGames = function (users) {
    console.log('Retrieved ' + users.length + ' user(s).');

    var runner = new GameRunner(database, users);

    return runner.runAndSaveAllGames();
  };

  this.updateLeaderboards = function () {
    return updateLeaderboardFn(userRecords, database);
  };

  this.showErrors = function (error) {
    console.log(error.stack);
    throw error;
  };

  this.closeDatabase = function () {
    database.close();
    console.log('Database connection ended.');
  };

  this.run = function () {
    self.openDatabase()
      .then(self.getUserRecords)
      .then(self.runGames)
      .then(self.updateLeaderboards)
      .catch(self.showErrors)
      .finally(self.closeDatabase);
  };
}

module.exports = LiveGameRunner;