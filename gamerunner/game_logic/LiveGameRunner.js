const GameRunner = require('./GameRunner.js');
const db = require('../../database/knex');

class LiveGameRunner {

    getUserRecords () {
        return db.select('*').from('player').where('enabled', true);
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
        db.destroy();
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
