// Update with your config settings.
const config = require('../../config');


module.exports = {

    development: {
        client: 'postgresql',
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
        client: 'postgresql',
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
        client: 'postgresql',
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
    }

};
