'use strict';

var fs = require('fs'),
    vm = require('vm'),
    Q = require('q'),
    GameEngine = require('ai-battle-engine'),
    engine = new GameEngine(),
    db = require('../../database/connect.js'),
    dbHelper = new (require('../../database/helper.js'))(db);

/**
 * Class for running games. It will plan out the games that need to be run
 * immediately.
 * @param {Object[]} users User information
 */
function GameRunner (users) {
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
        runGameTurnFn,
        initialGameTiles;

  // Store the initial game board so we have a starting point to replay battles
    game.board.initialTiles = JSON.parse(JSON.stringify(game.board.tiles));

    runGameTurnFn = function (game) {
        var activeHero = game.activeHero,
            action = this.runHeroBrain(game, userLookup[activeHero.name]);

    // console.log(
    //   [
    //     'Turn: ' + game.turn,
    //     'User: ' + activeHero.name,
    //     'Action: ' + action
    //   ].join(', ')
    // );

        if (game.turn % 25 === 0 || game.ended) {
            process.stdout.write('Playing game, turn ' + game.turn + '\r');
        }

        if (game.ended) {
            console.log('');
      // console.log(game);
            game.board.inspect();
            return game;
        } else {
      // Store hero actions
            if (!game.events) {
                game.events = [];
            }

            game.events.push(
                [
                    game.activeHero.id,
                    action
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
    let githubHandle = user.github_login;
    let rootPath = __dirname + '/../user_code';
    let heroFilePath = rootPath + '/hero/' + githubHandle + '_hero.js';
    let helperFilePath = rootPath + '/helpers/' + githubHandle + '_helpers.js';

    if (!fs.existsSync(heroFilePath) || !fs.existsSync(helperFilePath)) {
        console.warn(`No AI found for ${githubHandle}`);
        return;
    }

    let heroFile = fs.readFileSync(heroFilePath, 'utf8');
    let helperFile = fs.readFileSync(helperFilePath, 'utf8');

    let safeGameData = JSON.parse(JSON.stringify(game));
    let emptyFn = function () {};

    let allowed = {
        'North': 'North',
        'East': 'East',
        'South': 'South',
        'West': 'West',
        'Stay': null
    };

    try {
        // Anything that goes into the sandbox MUST BE a copy so that the hero AI
        // is unable to cause trouble in the rest of the application.
        let sandbox = {
            gameData: safeGameData,
            helpers: require(helperFilePath),
            move: require(heroFilePath)
        };

        let vmOptions = {
            filename: githubHandle,
            timeout: 3000
        };

        try {
            vm.runInNewContext('moveResult=move(gameData, helpers)', sandbox, vmOptions);
        } catch (ex) {
            console.warn(`(${ex.stack}) caused by ${githubHandle}`);
        }

        // Anything coming out of the sandbox MUST BE sanitized.
        let result = sandbox.moveResult;

        if (typeof result === "string" && result.length <= 10) {
            if (allowed.hasOwnProperty(result)) {
                return allowed[result];
            } else {
                console.warn(`Invalid move (${result}) by ${githubHandle}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
};

/**
 * Runs and saves all of the games, reporting progress as it goes.
 */
GameRunner.prototype.runAndSaveAllGames = function () {
    var promises = [],
        games,
        game;

    if (!this.users.length) {
        console.log('No users. Quitting.');
        db.end();
        return false;
    }

    games = this.planGames(this.users);

    if (!games.length) {
        console.log('No games planned. Quitting.');
        db.end();
        return false;
    }

    console.log(`${games.length} games left to play!`);

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
        gameCollection,
        heroes,
        players,
        initialMap,
        insertSql,
        record;

    console.log('Saving game ' + game.gameNumber);

    heroes = me.scrubHeroes(game.heroes);
    players = me.getPlayers(game.heroes);
    initialMap = game.board.initialTiles;

  // This data is necessary to start the game
    record = {
        totalTurns: game.maxTurn,
        playedAt: new Date(),
        players: players,
        heroes: JSON.stringify(heroes),
        initialMap: JSON.stringify(initialMap)
    };

    insertSql = dbHelper.insertSql('game', record);

    return Q.ninvoke(db, 'query', insertSql, record)
  .then(function (results) {
      var gameId = results[0].id,
          inserts = [];

      game.gameId = gameId;

    // This data is necessary to replay the game
      game.events.forEach(function (turn, index) {
          inserts.push(Q.ninvoke(db, 'update',
        `INSERT INTO game_events (
          game_id,
          turn,
          actor,
          action
        ) VALUES ($1, $2, $3, $4)`,
        [gameId, index].concat(turn)
      ));
      });

      return Q.all(inserts);
  })
  .catch(function (err) {
      console.log(err.stack);
  })
  .then(function (results) {
      return me.updateAndSaveAllHeroStats(game);
  })
  .then(function () {
      return me.saveGameResults(game);
  });
};

/**
 * Clean up hero data so we can store it in the database.
 * @param  {Object[]} heroes Hero game data
 * @param  {String} [type] The type of scrubbing to do
 * @return {Object[]} Scrubbed hero data
 */
GameRunner.prototype.scrubHeroes = function (heroes, type) {
    var scrubbed = [],
        hero;

    for (var i=0; i < heroes.length; i++) {
        hero = heroes[i];

        if (type === 'stats') {
      // Data for game_results table
            scrubbed.push(
                {
                    id: hero.id,
                    team: hero.team,
                    name: hero.name,
                    dead: hero.dead,
                    kills: hero.heroesKilled.length,
                    damageGiven: hero.damageDone,
                    minesTaken: hero.minesCaptured,
                    diamondsEarned: hero.diamondsEarned,
                    healthRecovered: hero.healthRecovered,
                    gravesTaken: hero.gravesRobbed,
                    healthGiven: hero.healthGiven
                }
      );
        } else {
      // Data for game table
            scrubbed.push(
                {
                    id: hero.id,
                    team: hero.team,
                    name: hero.name
                }
      );
        }
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

    var me = this;

    return dbHelper.getAllPlayerLifetimeStats().then(function (playerStats) {
        var heroes = game.heroes.slice(),
            promises = [],
            insert = false,
            hero,
            stats;

        for (let i =0; i < heroes.length; i++){
            hero = heroes[i];
            stats = me.findPlayerRecord(hero.name, playerStats);

            if (!stats) {
                insert = true;
                stats = {
                    github_login: hero.name
                };
            }

            stats = me.updateHeroStats(hero, stats);

            promises.push(me.saveUserStats(stats, insert));
        }

        console.log('All user stats updated for game #' + game.gameNumber);

        return Q.all(promises);
    });

};

GameRunner.prototype.findPlayerRecord = function (playerName, records) {
    for (let i = 0; i < records.length; i++) {
        if (records[i].github_login === playerName) {
            return records[i];
        }
    }
};

GameRunner.prototype.saveGameResults = function (game) {
    let me = this;
    let heroes = me.scrubHeroes(game.heroes, 'stats');
    let players = me.getPlayers(game.heroes);

  // This data is necessary to start the game
    let record = {
        gameId: game.gameId,
        winningTeam: game.winningTeam,
        players: players,
        heroes: JSON.stringify(heroes)
    };

    let insertSql = dbHelper.insertSql('game_results', record, 'game_id');

    return Q.ninvoke(db, 'query', insertSql, record);
};

/**
 * Performs the update of the hero statistics and applies the changes to te user record.
 * @param  {Hero} hero   The hero object
 * @param  {Object} user   The user record
 * @return {Object}        The updated user record
 */
GameRunner.prototype.updateHeroStats = function (hero, stats) {

    var me = this;

    if (hero.dead) {
        me.updateStat('deaths', stats, 1);
    }

    me.updateStat('kills', stats, hero.heroesKilled.length);
    me.updateStat('damage_given', stats, hero.damageDone);
    me.updateStat('mines_taken', stats, hero.minesCaptured);
    me.updateStat('diamonds_earned', stats, hero.diamondsEarned);
    me.updateStat('health_recovered', stats, hero.healthRecovered);
    me.updateStat('graves_taken', stats, hero.gravesRobbed);
    me.updateStat('health_given', stats, hero.healthGiven);

    if (hero.won) {
        me.updateStat('games_won', stats, 1);
    } else {
        me.updateStat('games_lost', stats, 1);
    }

    return stats;
};

GameRunner.prototype.updateStat = function (statName, object, addValue) {
    if (!object[statName]) {
        object[statName] = 0;
    } else {
        object[statName] = Number.parseInt(object[statName], 10);
    }

    object[statName] += (Number.parseInt(addValue, 10) || 0);

    return object[statName];
};

/**
 * Saves user stats to the database.
 * @param  {Object} user The user record
 * @return {Promise} A promise object
 */
GameRunner.prototype.saveUserStats = function (stats, insert) {
    var githubHandle = stats.github_login,
        sql;

    if (insert) {
        console.info(`  Storing new statistics for ${stats.github_login}`);
    } else {
        console.info(`  Updating statistics for ${stats.github_login}`);
    }

    sql = dbHelper.upsertSql('player_lifetime_stats', stats, `github_login`);

    return Q.ninvoke(db, 'query', sql, stats);
};

module.exports = GameRunner;
