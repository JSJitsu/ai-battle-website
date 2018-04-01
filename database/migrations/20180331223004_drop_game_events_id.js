
exports.up = function (knex, Promise) {
    return knex.schema.table('game_events', function (table) {
        table.dropColumn('id');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('game_events', function (table) {
        table.increments('id');
    });
};
