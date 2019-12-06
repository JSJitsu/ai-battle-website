
exports.up = function (knex) {
    return knex.schema.table('game_events', function (table) {
        table.dropColumn('id');
    });
};

exports.down = function (knex) {
    return knex.schema.table('game_events', function (table) {
        table.increments('id');
    });
};
