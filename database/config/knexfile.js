// Update with your config settings.
const config = require('../../config');


module.exports = {

    development: {
        client: 'pg',
        connection: {
            database: config.database.name,
            user: config.database.user,
            password: config.database.password
        },
        migrations: {
            directory: config.application.rootDirectory + '/database/migrations'
        }
    },

    staging: {
        client: 'pg',
        connection: {
            database: config.database.name,
            user: config.database.user,
            password: config.database.password
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            directory: config.application.rootDirectory + '/database/migrations'
        }
    },

    production: {
        client: 'pg',
        evictionRunIntervalMillis: 20000,
        connection: {
            database: config.database.name,
            user: config.database.user,
            password: config.database.password
        },
        pool: {
            min: 3,
            max: 15
        },
        migrations: {
            directory: config.application.rootDirectory + '/database/migrations'
        }
    }

};
