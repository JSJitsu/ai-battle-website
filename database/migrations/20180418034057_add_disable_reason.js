
exports.up = function (knex, Promise) {
    return knex.schema.table('player', function (table) {
        table.string('disable_reason', [100]);
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('player', function (table) {
        table.dropColumn('disable_reason');
    });
};
