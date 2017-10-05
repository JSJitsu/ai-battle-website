const Q = require('q');
const GameRunner = require('./GameRunner.js');
const db = require('../../database/connect.js');

Q.longStackSupport = true;

class LiveGameRunner {

    getUserRecords () {
        return Q.ninvoke(db, 'query', "SELECT * FROM player");
    }

    runGames (users) {
        console.log('Retrieved ' + users.length + ' user(s).');

        const runner = new GameRunner(users);

        return runner.runAndSaveAllGames();
    }

    showErrors (error) {
        console.log(error.stack);
    }

    closeDatabase () {
        db.end();
        console.log('Database connection ended.');
    }

    run () {
        this.getUserRecords()
            .then(this.runGames)
            .then(this.closeDatabase)
            .catch(this.showErrors)
            .done();
    }
}

module.exports = LiveGameRunner;
