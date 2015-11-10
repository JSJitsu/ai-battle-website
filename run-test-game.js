/**
 * Run this file to generate a test battle which will be added to the database.
 */

var LiveGameRunner = require('./game_logic/LiveGameRunner.js'),
    GameRunner = require('./game_logic/GameRunner.js'),
    testGameRunner = new LiveGameRunner();

testGameRunner.runGames = function () {
  var self = testGameRunner,
      players = [],
      runner,
      names;

  console.log('Setting up to run a test game. The results will be stored in the database.');

  names = [
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

  runner = new GameRunner(self.database);
  games = runner.planGames(players);

  game = games[0];
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

  gameResult = runner.runGame(game);
  runner.saveGame(gameResult).then(function () {
    console.log(gameResult);
  });
};

testGameRunner.updateAndSaveAllHeroStats = function () {
  return Q.fcall(function () { return true; });
};

testGameRunner.run = function () {
  var self = testGameRunner;

  self.openDatabase()
    .then(self.runGames)
    .catch(self.showErrors)
    .finally(self.closeDatabase);
};

testGameRunner.run();