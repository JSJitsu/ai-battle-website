if (process.argv[2] !== '--proceed') {
    let message = [
        'This script will drop all data in the database!',
        'To proceed, run this script again with the "--proceed" flag.'
    ].join('\n');

    console.log(message);
    process.exit(1);
}

const db = require('./knex');

// Still need to find a way to do the rollback using Knex, that still doesn't
// suport a reset method or similar.
let sql = `
    DROP TABLE IF EXISTS player;
    DROP TABLE IF EXISTS game_results;
    DROP TABLE IF EXISTS game;
    DROP TYPE IF EXISTS actor_action CASCADE;
    DROP TABLE IF EXISTS game_events;
    DROP TABLE IF EXISTS player_lifetime_stats;
    DROP TABLE IF EXISTS knex_migrations;
    DROP TABLE IF EXISTS knex_migrations_lock;
`;

db.raw(sql).
    then( () => {
        console.log('All database tables destroyed.');
    })
    .then( () => {
        return db.migrate.latest().then( () => {
            console.log('Database reset completed.');
            process.exit();
        });
    })
    .catch(err => {
        console.error('Error destroying all database tables');
        console.error(err.message);
    });
