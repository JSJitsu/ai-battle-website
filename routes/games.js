const express = require('express');
const router = express.Router();
const Q = require('q');

const db = require('../database/connect.js');

/**
 * Retrieves the latest game or the game with the given id.
 */
router.get('/latest', function (req, res) {
    let query = `SELECT id, players FROM game WHERE date_trunc('day', played_at) = (
        SELECT date_trunc('day', played_at) AS played_date FROM game ORDER BY id DESC LIMIT 1
    ) ORDER BY id ASC`;

    return Q.ninvoke(db, 'query', query)
        .then(function (games) {
            res.status(200).send(games);
        }).catch(function (err) {
            console.error(err);
            res.status(500).send();
            throw err;
        });
});

module.exports = router;
