var fs = require('fs'),
    vm = require('vm'),
    Q = require('q'),
    GameEngine = require('ai-battle-engine'),
    engine = new GameEngine(),
    secrets = require('../secrets.js'),
    actions = require('./ActionConstants.js');


/**
 * Class for running games. It will plan out the games that need to be run
 * immediately.
 * @param {SafeMongoConnection} database Database class
 * @param {Object[]} users User information
 */
function GameRunner (database, users) {
  this.database = database;
  this.users = users;
  this.gamesCompleted = 0;
}

/**
 * Plans the games that need to be played.
 * @param  {Object[]} users User information
 * @return {Game[]} An array of games that need to run
 */
GameRunner.prototype.planGames = function (users) {
  var plannedGames = engine.planAllGames(users);

  this.games = plannedGames.games;
  this.userLookup = plannedGames.userLookup;

  return this.games;
};

/**
 * Plays a game from start to finish, returning the final game state when
 * complete.
 * @param  {Game} game The game object
 * @return {Game}      The final state of the game object
 */
GameRunner.prototype.runGame = function (game) {

  var userLookup = this.userLookup,
      runGameTurnFn;

  runGameTurnFn = function(game) {
    var activeHero = game.activeHero,
        action = this.runHeroBrain(game, userLookup[activeHero.name]);

    console.log(
      [
        'Turn: ' + game.turn,
        'User: ' + activeHero.name,
        'Action: ' + action
      ].join(', ')
    );

    if (game.ended) {
      return game;
    } else {
      // Store hero actions
      if (!game.events) {
        game.events = [];
      }

      game.events.push(
        [
          game.activeHero.id,
          actions.toDatabase[action]
        ]
      );

      // Advance the game one turn
      game.handleHeroTurn(action);

      return runGameTurnFn.call(this, game);
    }
  };

  console.log('Running game ' + game.gameNumber);

  return runGameTurnFn.call(this, game);
};

/**
 * Loads a GitHub user's code and runs it in a sandbox so we can safely
 * determine which action the AI should take.
 * @param  {Game} game The game object
 * @param  {Object} user User information
 * @return {String}      The action to take
 */
GameRunner.prototype.runHeroBrain = function (game, user) {
  var rootPath = __dirname + '/../user_code',
      heroFilePath = rootPath + '/hero/' + user.githubHandle + '_hero.js',
      helperFilePath = rootPath + '/helpers/' + user.githubHandle + '_helpers.js',
      heroFile,
      helperFile,
      script,
      result,
      sandbox,
      vmOptions,
      safeGameData;

  heroFile = fs.readFileSync(heroFilePath, 'utf8');
  helperFile = fs.readFileSync(helperFilePath, 'utf8');

  safeGameData = JSON.parse(JSON.stringify(game));

  try {
    // Anything that goes into the sandbox MUST BE a copy so that the hero AI
    // is unable to cause trouble in the rest of the application.
    sandbox = {
      gameData: safeGameData,
      helpers: require(helperFilePath),
      move: require(heroFilePath)
    };

    vmOptions = {
      displayErrors: true,
      filename: user.githubHandle,
      timeout: 3000
    };

    vm.runInNewContext('moveResult=move(gameData, helpers)', sandbox, vmOptions);

    // Anything coming out of the sandbox MUST BE sanitized.
    result = sandbox.moveResult;

    if (result !== undefined) {
      result = result.toString();
    }
  } catch (e) {
    console.error(e);
  }

  return result;
};

/**
 * Runs and saves all of the games, reporting progress as it goes.
 */
GameRunner.prototype.runAndSaveAllGames = function () {
  var promises = [],
      games,
      game;

  games = this.planGames(this.users);

  console.log(this.gamesCompleted + ' games completed. ' + games.length + ' games left to play!');

  while (games.length) {
    game = games.shift();

    game.gameNumber = this.gamesCompleted;

    this.runGame(game);
    this.gamesCompleted++;

    promises.push(this.saveGame(game));
  }

  return Q.all(promises);
};

/**
 * @param  {Game} game The current state of the game.
 * @return {promise}
 */
GameRunner.prototype.saveGame = function (game) {
  var me = this,
      db = this.database,
      gameCollection,
      heroes;

  console.log('Saving game ' + game.gameNumber);

  heroes = me.scrubHeroes(game.heroes);
  players = me.getPlayers(game.heroes);

  gameCollection = db.collection('jsBattleGameData');

  return Q.ninvoke(gameCollection, 'save',
    {
      date: new Date(),
      players: players,
      winningTeam: game.winningTeam,
      maxTurn: game.maxTurn,
      heroes: heroes,
      events: game.events
    }
  ).then(function (result) {
    game.gameId = result.ops[0]._id;
    return me.updateAndSaveAllHeroStats(game);
  });
};

/**
 * Clean up hero data so we can store it in the database.
 * @param  {Object[]} heroes Hero game data
 * @return {Object[]} Scrubbed hero data
 */
GameRunner.prototype.scrubHeroes = function (heroes) {
  var scrubbed = [],
      hero;

  for (var i=0; i < heroes.length; i++) {
    hero = heroes[i];

    scrubbed.push(
      {
        id: hero.id,
        team: hero.team,
        name: hero.name
      }
    );
  }

  return scrubbed;
};

/**
 * Extract the player information from the heroes data.
 * @param  {Object[]} heroes Hero game data
 * @return {String[]} List of players
 */
GameRunner.prototype.getPlayers = function (heroes) {
  var players = [],
      hero;

  for (var i=0; i < heroes.length; i++) {
    hero = heroes[i];
    players.push(hero.name);
  }

  return players;
};

/**
 * Updates all hero stats after the battle and saves them to the database.
 * @param  {Game} game The game data
 * @return {Promise} A promise object
 */
GameRunner.prototype.updateAndSaveAllHeroStats = function (game) {
  console.log('Updating all user stats...');

  var heroes = game.heroes.slice(),
      promises = [],
      hero,
      user;

  while (heroes.length) {
    hero = heroes.pop();
    user = this.userLookup[hero.name];

    user = this.updateHeroStats(hero, user, game.gameId);

    promises.push(this.saveUserStats(user));
  }

  console.log('All user stats updated for game #' + game.gameNumber);

  return Q.all(promises);
};

/**
 * Performs the update of the hero statistics and applies the changes to te user record.
 * @param  {Hero} hero   The hero object
 * @param  {Object} user   The user record
 * @param  {String} gameId The game id
 * @return {Object}        The updated user record
 */
GameRunner.prototype.updateHeroStats = function (hero, user, gameId) {
  //Update the number of the most recently played game
  user.mostRecentGameId = gameId;

  //Update the user's lifetime and most recent stats
  user.lifetimeStats.kills += hero.heroesKilled.length;
  user.mostRecentStats.kills = hero.heroesKilled.length;

  if (hero.dead) {
    user.lifetimeStats.deaths++;
    user.mostRecentStats.survived = false;
  } else {
    user.mostRecentStats.survived = true;
  }

  user.lifetimeStats.damageDealt += hero.damageDone;
  user.mostRecentStats.damageDealt = hero.damageDone;

  user.lifetimeStats.minesCaptured += hero.minesCaptured;
  user.mostRecentStats.minesCaptured = hero.minesCaptured;

  user.lifetimeStats.diamondsEarned += hero.diamondsEarned;
  user.mostRecentStats.diamondsEarned = hero.diamondsEarned;

  user.lifetimeStats.healthRecovered += hero.healthRecovered;
  user.mostRecentStats.healthRecovered = hero.healthRecovered;

  if (user.lifetimeStats.healthGiven) {
    user.lifetimeStats.healthGiven += hero.healthGiven;
  } else {
    user.lifetimeStats.healthGiven = hero.healthGiven;
  }

  user.mostRecentStats.healthGiven = hero.healthGiven;

  user.lifetimeStats.gravesRobbed += hero.gravesRobbed;
  user.mostRecentStats.gravesRobbed = hero.gravesRobbed;

  if (hero.won) {
    user.lifetimeStats.wins++;
    user.mostRecentStats.gameResult = 'Win';
  } else {
    user.lifetimeStats.losses++;
    user.mostRecentStats.gameResult = 'Loss';
  }

  return user;
};

/**
 * Saves user stats to the database.
 * @param  {Object} user The user record
 * @return {Promise} A promise object
 */
GameRunner.prototype.saveUserStats = function (user) {
  console.log('  Saving stats for user: ' + user.githubHandle);

  var me = this,
      userCollection = this.database.collection('users');

  return Q.ninvoke(userCollection, 'save', user);

};

module.exports = GameRunner;