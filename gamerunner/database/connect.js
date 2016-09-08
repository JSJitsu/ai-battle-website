var pg = require('pg');
var secrets = require('../secrets');
var path = require('path');

if (!secrets.postgresUrl) {
    var message = 'PostgreSQL connection string must be defined in ',
        location = path.resolve(path.dirname(require.main.filename), 'secrets.js');

    throw new Error(message + location);
}

var db = require('pg-db')(secrets.postgresUrl);

module.exports = db;