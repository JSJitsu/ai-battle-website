const express = require('express');
const router = express.Router();
const Q = require('q');

const db = require('../database/knex');
const dbHelper = new (require('../database/helper.js'))(db);

router.get('/:github_login/games', function (req, res) {
    let username = req.params.github_login;

    return dbHelper.getGameResultsByUsername(username).then(function (gameResults) {

        let games = gameResults || [];

        games.forEach(function (game) {

            if (!game.heroes) {
                game.gameResult = 'Missing Data';
                return;
            }

            game.winner = false;

            for (let hero of game.heroes) {
                if (hero.name === username) {
                    game.winner = (hero.team.toString() === game.winning_team);
                    break;
                }
            }

            delete game.heroes;
        });

        res.send(games);
    });
});

router.get('/:github_login/stats/:type?', function (req, res) {
    let username = req.params.github_login;
    let type = req.params.type;
    let stats = {};
    let promises = [];

    if (type) {
        statistics[type](username).then(result => res.send(result));
    } else {
        Q.all([
            statistics.recent(username),
            statistics.average(username),
            statistics.lifetime(username)
        ]).then(results => {
            res.send({
                recent: results[0],
                average: results[1],
                lifetime: results[2]
            });
        });
    }
});

const statistics = {
    recent: function getRecentStats (username) {
        return dbHelper.getLatestGameResultByUsername(username).then(function (gameResults) {
            let gameResult = gameResults[0];
            let stats = {};

            if (gameResult) {
                let playerDataIndex = gameResult.players.indexOf(username);

                if (playerDataIndex !== -1) {
                    stats = gameResult.heroes[playerDataIndex];
                    stats.winner = (gameResult.winning_team === stats.team);
                }
            }

            return stats;
        });
    },
    average: function getAverageStats (username) {
        return dbHelper.getAllGameResultsByUsername(username).then(function (gameResults) {

            let deaths = 0;
            let kills = 0;
            let kdRatio = 0;
            let minesTaken = 0;
            let damageGiven = 0;
            let gravesTaken = 0;
            let healthGiven = 0;
            let diamondsEarned = 0;
            let healthRecovered = 0;

            gameResults.forEach(function (gameResult) {
                let playerDataIndex = gameResult.players.indexOf(username);

                if (playerDataIndex !== -1) {
                    let stats = gameResult.heroes[playerDataIndex];

                    deaths += (stats.dead ? 1 : 0);
                    kills += stats.kills;
                    kdRatio += (kills / (deaths || 1));
                    minesTaken += stats.minesTaken;
                    damageGiven += stats.damageGiven;
                    gravesTaken += stats.gravesTaken;
                    healthGiven += stats.healthGiven;
                    diamondsEarned += stats.diamondsEarned;
                    healthRecovered += stats.healthRecovered;
                }
            });

            let totalGames = gameResults.length;

            if (totalGames > 0) {
                kills = (kills / totalGames).toFixed(2);
                kdRatio = (kdRatio / totalGames).toFixed(2);
                minesTaken = (minesTaken / totalGames).toFixed(2);
                damageGiven = (damageGiven / totalGames).toFixed(2);
                gravesTaken = (gravesTaken / totalGames).toFixed(2);
                healthGiven = (healthGiven / totalGames).toFixed(2);
                diamondsEarned = (diamondsEarned / totalGames).toFixed(2);
                healthRecovered = (healthRecovered / totalGames).toFixed(2);
            }

            return {
                gamesPlayed: totalGames,
                kdRatio,
                kills,
                minesTaken,
                damageGiven,
                gravesTaken,
                healthGiven,
                diamondsEarned,
                healthRecovered
            };
        });
    },
    lifetime: function getLifetimeStats (username) {
        return dbHelper.getPlayerLifetimeStats(username).then(function (stats) {
            return stats[0];
        });
    }
};

module.exports = router;