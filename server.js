const console = require('better-console');
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');

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

    var options = {
        useGithubApp: (argv.github === undefined),
        github: {
            clientId: argv['github-client-id'],
            clientSecret: argv['github-client-secret'],
            callbackUrl: argv['github-callback-url']
        }
    };

    if (options.useGithubApp && (!options.github.clientId || !options.github.clientSecret)) {
        var usage = [
            'Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' [parameters]',
            '',
            'Required Parameters:',
            '',
            '  --github-client-id      GitHub Application Client ID',
            '  --github-client-secret  GitHub Application Client Secret',
            '        OR',
            '  --no-github             Do not connect to the GitHub application.',
            '',
            'Optional Parameters:',
            '',
            '  --github-callback-url   Specify the callback used for user auth.',
            ''
        ].join('\n');

        console.log(usage);

        process.exit(0);
    }

    const app = express();

    app.use(morgan('combined'));

    app.use('/api/game', require('./routes/game'));
    app.use('/api/games', require('./routes/games'));
    app.use('/api/leaderboard', require('./routes/leaderboard'));

    // Serve up files in public folder
    app.use('/', express.static(__dirname + '/public'));

    // must serve up ejs files individually for Azure to accept in deployment
    app.get('/ejs_templates/:ejsTemplate', function (req, res) {
        // file server
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });

        res.end(fs.readFileSync(__dirname+'/public/ejs_templates/' +  req.params.ejsTemplate + '.ejs'));
    });

    // Add github authentication
    if (options.useGithubApp) {
        OAuthGithub(app, db, dbHelper, options);
    }

    let port = process.env.PORT || config.application.port;

    app.listen(port);

    console.log('Listening on port: ', port);
}
