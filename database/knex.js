// If not set, define the environment as 'development'
const environment = process.env.NODE_ENV || 'development';

// Initializing according to the environment.
const config = require('./config/knexfile.js')[environment];

const knex = require('knex')(config);

// Will run everytime the server startup and will apply any pending migration
knex.migrate.latest([config]);

// Initializing Knex function with our database configs.
module.exports = knex;
