'use strict';

const fs = require('fs');
const vm = require('vm');
const Q = require('q');
const GameEngine = require('ai-battle-engine');
const engine = new GameEngine();
const db = require('../../database/knex');
const dbHelper = new (require('../../database/helper.js'))(db);

/**
 * Class for running games. It will plan out the games that need to be run
 * immediately.
 * @param {Object[]} users User information
 */
class GameRunner {
    constructor (users) {
        this.users = users;
        this.gamesCompleted = 0;
    }

    /**
     * Plans the games that need to be played.
     * @param  {Object[]} users User information
     * @return {Game[]} An array of games that need to run
     */
    planGames (users) {
        const plannedGames = engine.planAllGames(users);

        this.games = plannedGames.games;
        this.userLookup = plannedGames.userLookup;

        return this.games;
    }

    /**
     * Plays a game from start to finish, returning the final game state when
     * complete.
     * @param  {Game} game The game object
     * @return {Game}      The final state of the game object
     */
    runGame (game) {

        const userLookup = this.userLookup;

        // Store the initial game board so we have a starting point to replay battles
        game.board.initialTiles = JSON.parse(JSON.stringify(game.board.tiles));

        const runGameTurnFn = function (game) {
            const activeHero = game.activeHero;
            const action = this.runHeroBrain(game, userLookup[activeHero.name]);

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

        let time = (new Date()).toISOString();

        console.log(`Running game ${game.gameNumber} at ${time}`);

        return runGameTurnFn.call(this, game);
    }

    /**
     * Loads a GitHub user's code and runs it in a sandbox so we can safely
     * determine which action the AI should take.
     * @param  {Game} game The game object
     * @param  {Object} user User information
     * @return {String}      The action to take
     */
    runHeroBrain (game, user) {
        const githubHandle = user.github_login;
        const rootPath = __dirname + '/../user_code';
        const heroFilePath = rootPath + '/hero/' + githubHandle + '_hero.js';
        const helperFilePath = rootPath + '/helpers/' + githubHandle + '_helpers.js';

        if (!fs.existsSync(heroFilePath) || !fs.existsSync(helperFilePath)) {
            console.warn(`No AI found for ${githubHandle}`);
            return;
        }

        // TODO 3 unuseds
        const heroFile = fs.readFileSync(heroFilePath, 'utf8');
        const helperFile = fs.readFileSync(helperFilePath, 'utf8');

        const safeGameData = JSON.parse(JSON.stringify(game));
        const emptyFn = function () {};

        const allowed = {
            'North': 'North',
            'East': 'East',
            'South': 'South',
            'West': 'West',
            'Stay': null
        };

        try {
            // Anything that goes into the sandbox MUST BE a copy so that the hero AI
            // is unable to cause trouble in the rest of the application.
            const sandbox = {
                gameData: safeGameData,
                helpers: require(helperFilePath),
                move: require(heroFilePath)
            };

            const vmOptions = {
                filename: githubHandle,
                timeout: 3000
            };

            try {
                vm.runInNewContext('moveResult=move(gameData, helpers)', sandbox, vmOptions);
            } catch (ex) {
                console.warn(`(${ex.stack}) caused by ${githubHandle}`);
            }

            // Anything coming out of the sandbox MUST BE sanitized.
            const result = sandbox.moveResult;

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
    }

    /**
     * Runs and saves all of the games, reporting progress as it goes.
     */
    runAndSaveAllGames () {
        const promises = [];

        if (!this.users.length) {
            console.log('No users. Quitting.');
            db.destroy();
            return false;
        }

        const games = this.planGames(this.users);

        if (!games.length) {
            console.log('No games planned. Quitting.');
            db.destroy();
            return false;
        }

        console.log(`${games.length} games left to play!`);

        while (games.length) {
            const game = games.shift();

            game.gameNumber = this.gamesCompleted;

            this.runGame(game);
            this.gamesCompleted++;

            promises.push(this.saveGame(game));
        }

        return Q.all(promises);
    }

    /**
     * @param  {Game} game The current state of the game.
     * @return {promise}
     */
    saveGame (game) {
        console.log('Saving game ' + game.gameNumber);

        let heroes = this.scrubHeroes(game.heroes);
        let players = this.getPlayers(game.heroes);
        let initialMap = game.board.initialTiles;

        // This data is necessary to start the game
        let record = {
            total_turns: game.maxTurn,
            played_at: new Date(),
            players: players,
            heroes: JSON.stringify(heroes),
            initial_map: JSON.stringify(initialMap)
        };

        return db('game').insert(record, 'id').then(gameIds => {
            let gameId = gameIds[0];
            let gameEvents = [];

            game.gameId = gameId;

            // This data is necessary to replay the game
            game.events.forEach(function (turn, index) {
                gameEvents.push({
                    game_id: gameId,
                    turn: index,
                    actor: turn[0],
                    action: turn[1]
                });
            });

            return db('game_events').insert(gameEvents, 'game_id');
        })
        .catch(err => {
            console.log(err.stack);
        })
        .then(results => {
            return this.updateAndSaveAllHeroStats(game);
        })
        .then(() => {
            return this.saveGameResults(game);
        });
    }

    /**
     * Clean up hero data so we can store it in the database.
     * @param  {Object[]} heroes Hero game data
     * @param  {String} [type] The type of scrubbing to do
     * @return {Object[]} Scrubbed hero data
     */
    scrubHeroes (heroes, type) {
        return heroes.map(hero => {
            if (type === 'stats') {
                // Data for game_results table
                return {
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
                };
            } else {
                // Data for game table
                return {
                    id: hero.id,
                    team: hero.team,
                    name: hero.name
                };
            }
        });
    }

    /**
     * Extract the player information from the heroes data.
     * @param  {Object[]} heroes Hero game data
     * @return {String[]} List of players
     */
    getPlayers (heroes) {
        return heroes.map(hero => hero.name);
    }

    /**
     * Updates all hero stats after the battle and saves them to the database.
     * @param  {Game} game The game data
     * @return {Promise} A promise object
     */
    updateAndSaveAllHeroStats (game) {
        console.log('Updating all user stats...');

        return dbHelper.getAllPlayerLifetimeStats().then(playerStats => {
            const heroes = game.heroes.slice();

            const promises = heroes.map(hero => {
                let stats = this.findPlayerRecord(hero.name, playerStats);
                let insert = false;

                if (!stats) {
                    insert = true;
                    stats = {
                        github_login: hero.name
                    };
                }

                stats = this.updateHeroStats(hero, stats);
                return this.saveUserStats(stats, insert);
            });

            console.log('All user stats updated for game #' + game.gameNumber);

            return Q.all(promises);
        });
    }

    findPlayerRecord (playerName, records) {
        return records.find(record => record.github_login === playerName);
    }

    saveGameResults (game) {
        const heroes = this.scrubHeroes(game.heroes, 'stats');
        const players = this.getPlayers(game.heroes);

        // This data is necessary to start the game
        const record = {
            game_id: game.gameId,
            winning_team: game.winningTeam,
            players: players,
            heroes: JSON.stringify(heroes)
        };

        return db('game_results').insert(record, 'game_id');
    }

    /**
     * Performs the update of the hero statistics and applies the changes to te user record.
     * @param  {Hero} hero   The hero object
     * @param  {Object} user   The user record
     * @return {Object}        The updated user record
     */
    updateHeroStats (hero, stats) {

        if (hero.dead) {
            this.updateStat('deaths', stats, 1);
        }

        this.updateStat('kills', stats, hero.heroesKilled.length);
        this.updateStat('damage_given', stats, hero.damageDone);
        this.updateStat('mines_taken', stats, hero.minesCaptured);
        this.updateStat('diamonds_earned', stats, hero.diamondsEarned);
        this.updateStat('health_recovered', stats, hero.healthRecovered);
        this.updateStat('graves_taken', stats, hero.gravesRobbed);
        this.updateStat('health_given', stats, hero.healthGiven);

        if (hero.won) {
            this.updateStat('games_won', stats, 1);
        } else {
            this.updateStat('games_lost', stats, 1);
        }

        return stats;
    }

    updateStat (statName, object, addValue) {
        if (!object[statName]) {
            object[statName] = 0;
        } else {
            object[statName] = Number.parseInt(object[statName], 10);
        }

        object[statName] += (Number.parseInt(addValue, 10) || 0);

        return object[statName];
    }

    /**
     * Saves user stats to the database.
     * @param  {Object} user The user record
     * @return {Promise} A promise object
     */
    saveUserStats (stats, insert) {
        const githubHandle = stats.github_login;

        if (insert) {
            console.info(`  Storing new statistics for ${githubHandle}`);
            return db('player_lifetime_stats').insert(stats);
        } else {
            console.info(`  Updating statistics for ${githubHandle}`);
            return db('player_lifetime_stats').where('github_login', githubHandle).update(stats);
        }
    }

    closeDatabase () {
        return db.destroy();
    }
}

module.exports = GameRunner;
