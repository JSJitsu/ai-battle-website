/**
 * Run this file to generate a test battle which will be added to the database.
 */

const LiveGameRunner = require('./game_logic/LiveGameRunner.js');
const GameRunner = require('./game_logic/GameRunner.js');
const Q = require('q');

class TestGameRunner extends LiveGameRunner {
    runGames () {
        const players = [];

        console.log('Setting up to run a test game. The results will be stored in the database.');

        const names = [
            'Lyn',
            'Eliwood',
            'Hector',
            'Sain',
            'Kent',
            'Marcus',
            'Lowen',
            'Isadora',
            'Wallace',
            'Oswin',
            'Wil',
            'Rebecca',
            'Louise',
            'Rath',
            'Florina',
            'Fiora',
            'Farina',
            'Heath',
            'Vaida',
            'Erk',
            'Pent',
            'Nino',
            'Serra',
            'Lucius'
        ];

        for (let i = 0; i < names.length; i++) {
            players.push({
                github_login: names[i]
            });
        }

        const runner = new GameRunner(this.database);
        const games = runner.planGames(players);

        const game = games[0];
        game.gameNumber = 0;

        // Replace the hero brain that uses player files with this simpleton.
        runner.runHeroBrain = function () {
            const choices = [
                'North',
                'South',
                'East',
                'West'
            ];

            return choices[Math.floor(Math.random() * choices.length)];
        };

        let gameResult = runner.runGame(game);

        return Q.fcall(function () {
            return runner.saveGame(gameResult).then(function () {
                console.log(`Game saved with id ${gameResult.gameId}.`);
            });
        });
    }

    updateAndSaveAllHeroStats () {
        return Q.fcall(function () { return true; });
    }

    run () {
        this.runGames()
            .catch(this.showErrors)
            .finally(this.closeDatabase);
    };
}

const testGameRunner = new TestGameRunner();
testGameRunner.run();
