#!/usr/bin/node

const db = require ('./connect.js');

let sql = `
    CREATE TABLE player (
        github_login varchar(39) UNIQUE,
        github_id int UNIQUE,
        avatar_url varchar(100),
        code_repo varchar(100) DEFAULT 'hero-starter',
        code_branch varchar(100) DEFAULT 'master',
        joined_at timestamp,
        disabled boolean NOT NULL DEFAULT false,
        disbaled_count smallint NOT NULL DEFAULT 0,
        disabled_message varchar(20) DEFAULT NULL,
        last_update_date timestamp
    );
    CREATE TABLE game (
        id bigserial UNIQUE,
        total_turns int,
        played_at timestamp,
        players varchar(39)[],
        heroes jsonb,
        initial_map jsonb
    );
    CREATE TABLE game_results (
        game_id bigint references game(id) UNIQUE,
        winning_team varchar(39),
        players varchar(39)[],
        heroes jsonb
    );
    CREATE TYPE actor_action AS ENUM ('North', 'East', 'South', 'West');
    CREATE TABLE game_events (
        game_id bigint,
        turn int,
        actor smallint,
        action actor_action
    );
    CREATE TABLE player_lifetime_stats (
        github_login varchar(39) UNIQUE,
        kills bigint DEFAULT 0,
        deaths bigint DEFAULT 0,
        damage_given bigint DEFAULT 0,
        damage_taken bigint DEFAULT 0,
        mines_taken bigint DEFAULT 0,
        diamonds_earned bigint DEFAULT 0,
        health_given bigint DEFAULT 0,
        health_recovered bigint DEFAULT 0,
        graves_taken bigint DEFAULT 0,
        games_won bigint DEFAULT 0,
        games_lost bigint DEFAULT 0
    )
`;

db.execute(sql, function (err) {
    if (err) {
        console.error(`Error in: ${sql}`);
        throw err;
    }

    db.end();
});
