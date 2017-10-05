const config = require('../config');
const path = require('path');

let dbConf = config && config.database;

if (!dbConf) {
    let location = path.resolve(path.dirname(require.main.filename), 'config.js');

    throw new Error(`Database connection information must be defined in ${location}`);
}

let dbUri = `postgresql://${dbConf.user}:${dbConf.password}@${dbConf.address}/${dbConf.name}`;
let db = require('pg-db')(dbUri);

module.exports = db;
