const Q = require('q');
const GameRunner = require('./GameRunner.js');
const db = require('../../database/connect.js');

Q.longStackSupport = true;

function LiveGameRunner () {

    // TODO not sure where this is used?
    let userRecords;

    this.getUserRecords = function () {
        return Q.ninvoke(db, 'query', "SELECT * FROM player");
    };

    this.runGames = function (users) {
        console.log('Retrieved ' + users.length + ' user(s).');

        userRecords = users;

        const runner = new GameRunner(users);

        return runner.runAndSaveAllGames();
    };

    this.showErrors = function (error) {
        console.log(error.stack);
    };

    this.closeDatabase = function () {
        db.end();
        console.log('Database connection ended.');
    };

    this.run = () => {
        this.getUserRecords()
      .then(this.runGames)
      .then(this.closeDatabase)
      .catch(this.showErrors)
      .done();
    };
}

module.exports = LiveGameRunner;
