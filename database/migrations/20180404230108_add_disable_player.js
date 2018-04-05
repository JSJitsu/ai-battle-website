
exports.up = function (knex, Promise) {
    return knex.schema.table('player', function (table) {
        table.boolean('enabled').defaultTo(true);
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('player', function (table) {
        table.dropColumn('enabled');
    });
};
