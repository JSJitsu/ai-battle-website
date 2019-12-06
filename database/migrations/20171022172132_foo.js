/* global Promise */
exports.up = function (knex) {
    return Promise.all([
        // Add foo to player table
        knex.schema.table('player', (table) => {
            table.string('foo');
        })
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        // Drop foo from player table
        knex.schema.table('player', (table) => {
            table.dropColumn('foo');
        })
    ]);
};
