
exports.up = function (knex, Promise) {
    return Promise.all([
        // Table player
        knex.schema.createTable('player', (table) => {
            table.increments('id');
            table.string('github_login', [39]).unique();
            table.integer('github_id').unique();
            table.string('avatar_url', [100]);
            table.string('code_repo', [100]).defaultTo('hero-starter');
            table.string('code_branch', [100]).defaultTo('master');
            table.timestamp('joined_at').defaultTo(knex.fn.now());
        }),
        // Table game
        knex.schema.createTable('game', (table) => {
            table.bigincrements('id').unique();
            table.integer('total_turns');
            table.timestamp('played_at');
            table.specificType('players', 'varchar(39)[]');
            table.jsonb('heroes');
            table.jsonb('initial_map');
        }),
        // Table game_results
        knex.schema.createTable('game_results', (table) => {
            table.increments('id');
            table.bigint('game_id').references('id').inTable('game').unique();
            table.string('winning_team', [39]);
            table.specificType('players', 'varchar(39)[]');
            table.jsonb('heroes');
        }),
        // Type actor_action
        knex.schema.raw("CREATE TYPE actor_action AS ENUM ('North', 'East', 'South', 'West')"),
        // Table game_events
        knex.schema.createTable('game_events', (table) => {
            table.increments('id');
            table.bigint('game_id');
            table.integer('turn');
            table.smallint('actor');
            table.specificType('action', 'actor_action');
        }),
        // player_lifetime_stats
        knex.schema.createTable('player_lifetime_stats', (table) => {
            table.increments('id');
            table.string('github_login', [39]).unique();
            table.bigint('kills').defaultTo(0);
            table.bigint('deaths').defaultTo(0);
            table.bigint('damage_given').defaultTo(0);
            table.bigint('damage_taken').defaultTo(0);
            table.bigint('mines_taken').defaultTo(0);
            table.bigint('diamonds_earned').defaultTo(0);
            table.bigint('health_given').defaultTo(0);
            table.bigint('health_recovered').defaultTo(0);
            table.bigint('graves_taken').defaultTo(0);
            table.bigint('games_won').defaultTo(0);
            table.bigint('games_lost').defaultTo(0);
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('player'),
        knex.raw('DROP TABLE IF EXISTS game_results CASCADE'),
        knex.schema.dropTableIfExists('game'),
        knex.schema.dropTableIfExists('actor_action'),
        knex.raw('DROP TYPE IF EXISTS actor_action CASCADE'),
        knex.schema.dropTableIfExists('game_events'),
        knex.schema.dropTableIfExists('player_lifetime_stats')
    ]);
};
