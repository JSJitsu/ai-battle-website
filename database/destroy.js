#!/usr/bin/node

if (process.argv[2] !== '--proceed') {
    let message = [
        'This script will drop all data in the database!',
        'To proceed, run this script again with the "--proceed" flag.'
    ].join('\n');

    console.log(message);
    process.exit(1);
}

const db = require('./connect.js');

let sql = `
    DROP TABLE IF EXISTS player;
    DROP TABLE IF EXISTS game_results;
    DROP TABLE IF EXISTS game;
    DROP TYPE IF EXISTS actor_action CASCADE;
    DROP TABLE IF EXISTS game_events;
    DROP TABLE IF EXISTS player_lifetime_stats;
`;

db.execute(sql, function (err) {
    if (err) {
        console.error(`Error in: ${sql}`);
        throw err;
    }

    db.end();
});
