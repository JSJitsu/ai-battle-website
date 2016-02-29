'use strict';

var Q = require('q');

class Helper {

    constructor (database) {
        this.database = database;
        this.convertCamelCaseToUnderscore = true;
    }

    buildSqlParts (table, values) {

        var namedParams = [],
            columns;

        columns = Object.keys(values);

        columns.forEach(function (key) {
            namedParams.push(`:${key}`);
        });

        if (this.convertCamelCaseToUnderscore) {
            columns = columns.map(this.camelCaseToUnderscore);
        }

        columns = columns.join(', ');
        namedParams = namedParams.join(', ');

        return {
            columns: columns,
            namedParams: namedParams
        };
    }

    camelCaseToUnderscore (text) {
        return text.replace(/([A-Z])/,"_$1").toLowerCase();
    }

    updateSql (table, values, where) {
        var parts = this.buildSqlParts(table, values),
            sql;

        sql = `UPDATE ${table} (${parts.columns}) VALUES (${parts.namedParams}) WHERE ${where}`;

        return sql;
    }

    insertSql (table, values, primaryKey) {
        var parts = this.buildSqlParts(table, values),
            sql;

        primaryKey = primaryKey || 'id';

        sql = `INSERT INTO ${table} (${parts.columns}) VALUES (${parts.namedParams}) RETURNING ${primaryKey}`;

        return sql;
    }

    getAllPlayerLifetimeStats () {
        return Q.ninvoke(this.database, 'query', "SELECT * FROM player_lifetime_stats");
    }

}

module.exports = Helper;