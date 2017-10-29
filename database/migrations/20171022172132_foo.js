
exports.up = function (knex, Promise) {
    return Promise.all([
        // Add foo to player table
        knex.schema.table('player', (table) => {
            table.string('foo');
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        // Drop foo from player table
        knex.schema.table('player', (table) => {
            table.dropColumn('foo');
        })
    ]);
};
