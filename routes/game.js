const express = require('express');
const router = express.Router();

const db = require('../database/knex');

/**
 * Retrieves the latest game or the game with the given id.
 */
router.get('/(:id)?', function (req, res) {
    let gameId = Number.parseInt(req.params.id, 10);
    let latest = false;
    let query;

    if (Number.isInteger(gameId) && gameId > 0) {
        query = db.select('*').from('game').where('id', gameId);
    } else {
        latest = true;
        query = db.select('*').from('game').orderBy('id', 'desc').limit(1);
    }

    return query
        .then(function (games) {
            var game = games.shift();

            if (game) {
                return db.select('turn', 'actor', 'action').from('game_events').where('game_id', game.id).orderBy('turn', 'asc')
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