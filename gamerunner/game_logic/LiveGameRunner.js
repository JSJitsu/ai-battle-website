var Q = require('q');
var GameRunner = require('./GameRunner.js');
var secrets = require('../../secrets.js');
var db = require('../../database/connect.js');

Q.longStackSupport = true;

function LiveGameRunner () {

    var self = this,
        userRecords;

    this.getUserRecords = function () {
        return Q.ninvoke(db, 'query', "SELECT * FROM player");
    };

    this.runGames = function (users) {
        console.log('Retrieved ' + users.length + ' user(s).');

        userRecords = users;

        var runner = new GameRunner(users);

        return runner.runAndSaveAllGames();
    };

    this.showErrors = function (error) {
        console.log(error.stack);
    };

    this.closeDatabase = function () {
        db.end();
        console.log('Database connection ended.');
    };

    this.run = function () {
        self.getUserRecords()
      .then(self.runGames)
      .then(self.closeDatabase)
      .catch(self.showErrors)
      .done();
    };
}

module.exports = LiveGameRunner;