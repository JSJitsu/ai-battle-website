const express = require('express');
const router = express.Router();
const Q = require('q');

const db = require('../database/connect.js');

/**
 * Retrieves the latest game or the game with the given id.
 */
router.get('/(:id)?', function (req, res) {
    let gameId = Number.parseInt(req.params.id, 10);
    let latest = false;
    let query;

    if (Number.isInteger(gameId) && gameId > 0) {
        query = `SELECT * FROM game WHERE id = ${gameId}`;
    } else {
        latest = true;
        query = "SELECT * FROM game ORDER BY id DESC LIMIT 1";
    }

    return Q.ninvoke(db, 'query', query)
        .then(function (games) {
            var game = games.shift();

            if (game) {
                return Q.ninvoke(db, 'query', `SELECT turn, actor, action FROM game_events WHERE game_id = ${game.id} ORDER BY turn ASC`)
                    .then(function (gameEvents) {
                        game.events = gameEvents;

                        if (latest) {
                            game.latest = true;
                        }

                        res.status(200).send(game);
                    });
            } else {
                res.status(200).send({
                    noData: true
                });
            }
        }).catch(function (err) {
            console.error(err);
            res.status(500).send();
            throw err;
        });
});

module.exports = router;
