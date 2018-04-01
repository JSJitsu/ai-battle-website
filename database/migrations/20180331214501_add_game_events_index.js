
exports.up = function (knex, Promise) {
    return knex.schema.table('game_events', function (table) {
        table.index(['game_id']);
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('game_events', function (table) {
        table.dropIndex(['game_id']);
    });
};
