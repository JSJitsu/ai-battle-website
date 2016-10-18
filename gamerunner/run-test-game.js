/**
 * Run this file to generate a test battle which will be added to the database.
 */

var LiveGameRunner = require('./game_logic/LiveGameRunner.js'),
    GameRunner = require('./game_logic/GameRunner.js'),
    testGameRunner = new LiveGameRunner(),
    Q = require('q');

testGameRunner.runGames = function () {
    var self = testGameRunner,
        players = [];

    console.log('Setting up to run a test game. The results will be stored in the database.');

    let names = [
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

    for (var i = 0; i < names.length; i++) {
        players.push({
            githubHandle: names[i]
        });
    }

    let runner = new GameRunner(self.database);
    let games = runner.planGames(players);

    let game = games[0];
    game.gameNumber = 0;

  // Replace the hero brain that uses player files with this simpleton.
    runner.runHeroBrain = function () {
        var choices = [
            'North',
            'South',
            'East',
            'West'
        ];

        return choices[Math.floor(Math.random()*4)];
    };

    let gameResult = runner.runGame(game);

    return Q.fcall(function () {
        runner.saveGame(gameResult).then(function () {
            console.log(gameResult);
        });
    });
};

testGameRunner.updateAndSaveAllHeroStats = function () {
    return Q.fcall(function () { return true; });
};

testGameRunner.run = function () {
    var self = testGameRunner;

    self.runGames()
    .catch(self.showErrors)
    .finally(self.closeDatabase);
};

testGameRunner.run();