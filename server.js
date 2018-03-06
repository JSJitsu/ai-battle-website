const console = require('better-console');
const express = require('express');
const morgan = require('morgan');

const OAuthGithub = require('./server/OAuthGithub');
const argv = require('minimist')(process.argv.slice(2));
const config = require('./config');
const db = require('./database/connect.js');
const dbHelper = new (require('./database/helper.js'))(db);

// Test the database connection
db.connect(function (err) {
    if (err) {
        console.error('Unable to connect to database!');
        console.error(err.message);

        process.exit(1);
        db.end();
    }

    startServer();
});

function startServer () {

    let options = {
        useGithubApp: (argv.github !== false),
        github: {
            clientId: argv['github-client-id'],
            clientSecret: argv['github-client-secret'],
            callbackUrl: argv['github-callback-url'],
            pretendAuthAs: argv['pretend-auth-as']
        }
    };

    let showUsage = argv['help'];

    if (options.useGithubApp && (!options.github.clientId || !options.github.clientSecret)) {
        showUsage = true;
    }

    if (options.github.pretendAuthAs) {
        options.useGithubApp = true;
        showUsage = false;
    } else if (options.useGithubApp) {
        showUsage = false;
    }

    if (showUsage) {
        var usage = [
            'Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' [parameters]',
            '',
            'Required Parameters:',
            '',
            '  --github-client-id      GitHub Application Client ID',
            '  --github-client-secret  GitHub Application Client Secret',
            '        OR',
            '  --no-github             Do not connect to the GitHub application.',
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

    const app = express();

    app.use(morgan('dev'));

    app.use('/api/game', require('./routes/game'));
    app.use('/api/games', require('./routes/games'));
    app.use('/api/leaderboard', require('./routes/leaderboard'));
    app.use('/api/users', require('./routes/users'));

    // Serve up files in public folder
    app.use('/', express.static(__dirname + '/public', {
        extensions: ['html']
    }));

    // Add github authentication
    if (options.useGithubApp) {
        OAuthGithub(app, db, dbHelper, options);
    }

    let port = process.env.PORT || config.application.port;

    app.listen(port);

    console.log('Listening on port: ', port);
}
