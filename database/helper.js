'use strict';

class Helper {

    constructor (database) {
        this.db = database;
    }

    errorHandler (error) {
        console.error(error);
    }

    getAllPlayerLifetimeStats () {
        return this.db.select('*').from('player_lifetime_stats');
    }

    getPlayerLifetimeStats (username) {
        username = this.cleanGithubLogin(username);
        return this.db.select('*').from('player_lifetime_stats').where('github_login', username);
    }

    getLatestGameResultByUsername (username) {
        return this.getAllGameResultsByUsername(username).limit(1);
    }

    getAllGameResultsByUsername (username) {
        username = this.cleanGithubLogin(username);
        return this.db.select('*').from('game_results').whereRaw('? = ANY(players)', [username]).orderBy('game_id', 'desc').limit(1);
    }

    getGameResultsByUsername (username) {
        username = this.cleanGithubLogin(username);
        return this.db.select('game.id', 'total_turns', 'played_at', 'winning_team', 'game_results.heroes')
            .from('game')
            .leftJoin('game_results', 'game.id', 'game_results.game_id')
            .whereRaw('? = ANY(game.players)', [username])
            .orderBy('id', 'desc');
    }

    cleanGithubLogin (username) {
        return username.replace(/[^a-zA-Z0-9-]/g, '');
    }

    getPlayer (username) {
        username = this.cleanGithubLogin(username);
        return this.db.select('*').from('player').where('github_login', username);
    }

    updatePlayer (record) {
        return this.db('player').where('github_login', record.github_login).update(record);
    }

    insertPlayer (record) {
        return this.db('player').insert(record);
    }

}

module.exports = Helper;
