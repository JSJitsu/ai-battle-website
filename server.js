const console = require('better-console');
const argv = require('minimist')(process.argv.slice(2));

if (argv['help']) {
    var usage = [
        'Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' [parameters]',
        '',
        'Required Parameters:',
        '',
        '  --github-client-id      GitHub Application Client ID',
        '  --github-client-secret  GitHub Application Client Secret',
        '        OR',
        '  --pretend-auth-as       The GitHub user to pretend to be when logging in.',
        '                          This prevents real authentication with GitHub.',
        '',
        'Optional Parameters:',
        '',
        '  --github-callback-url   Specify the callback used for user auth.',
        '  --help                  Show this message.',
        ''
    ].join('\n');

    console.log(usage);
    process.exit(0);
}

const compression = require('compression');
const express = require('express');
const morgan = require('morgan');

const OAuthGithub = require('./server/OAuthGithub');
let config;

try {
    config = require('./config');
} catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND') {
        console.warn(`'config.js' is missing. Copy from 'config-template.js' and update as needed.`);
        process.exit(1);
    }
}

const db = require('./database/knex');
const dbHelper = new (require('./database/helper.js'))(db);

// Test the database connection. Knex still doesn't have a very good way to
// do that. So, this check have to stay this way for a while until they improve
// the lib.
db.raw('select 1+1 as result').then( () => {
    // Apply migrations.
    db.migrate.latest()
        .then( () => {
            return console.log('Latest migrations applied');
        })
        .then ( () => {
            startServer();
        });
})
    .catch(err => {
        console.error('Error setting up the database');
        console.error(err.message);
    });

function startServer () {

    let options = {
        useGithub: false,
        pretendAuthAs: argv['pretend-auth-as'],
        github: {
            clientId: argv['github-client-id'],
            clientSecret: argv['github-client-secret'],
            callbackUrl: argv['github-callback-url']
        }
    };

    if (options.github.clientId && options.github.clientSecret) {
        options.useGithub = true;
    }

    if (options.useGithub === false && !options.pretendAuthAs) {
        console.warn('No real or test authentication with GitHub will be used. Re-run this script with --help for more information.');
    }

    const app = express();

    app.use(morgan('combined'));
    app.use(compression());

    app.use('/api/game', require('./routes/game'));
    app.use('/api/games', require('./routes/games'));
    app.use('/api/leaderboard', require('./routes/leaderboard'));
    app.use('/api/users', require('./routes/users'));
    app.use('/openapi', require('./routes/openapi'));

    // Serve up files in public folder
    app.use('/', express.static(__dirname + '/public', {
        extensions: ['html']
    }));

    // Add github authentication
    if (options.useGithub || options.pretendAuthAs) {
        OAuthGithub(app, db, dbHelper, config, options);
    }

    let port = process.env.PORT || config.application.port;

    app.listen(port);

    console.log('Listening on port: ', port);
}
