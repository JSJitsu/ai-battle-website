const console = require('better-console');
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const Q = require('q');

const OAuthGithub = require('./server/OAuthGithub');
const config = require('./config');
const db = require('./database/connect.js');
const dbHelper = new (require('./database/helper.js'))(db);
const argv = require('commander');
argv.description('Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' [options]')
    .option('--non-github',                    'Do not connect to the GitHub application, **OR**')
    .option('--github-client-id [string]',     '[Compulsory] - GitHub Application Client ID')
    .option('--github-client-secret [string]', '[Compulsory] - GitHub Application Client Secret')
    .option('--github-callback-url [string]',  '[Optional] - Specify the callback used for user auth.')
    .parse(process.argv);
if (process.argv.length<3) argv.help();

// cli input validation
// commander does not support OR condition yet
if ( typeof(argv.nonGithub)==='undefined' ) {
    if ( typeof(argv.githubClientId)=='undefined' ||
        typeof(argv.githubClientSecret)=='undefined' ) {
        console.log();
        console.log("  Both github client id and secret is needed!!!");
        argv.help();
        process.exit(1);
    }
}

// Test the database connection
db.connect(function (err) {
    if (err) {
        console.error('Unable to connect to database!');
        console.error(err.message);

        process.exit(1);
        db.end();
    }

    console.log("Here : ");
    console.log("argv.nonGithub          : " + argv.nonGithub);
    console.log("argv.githubClientId     : " + argv.githubClientId);
    console.log("argv.githubClientSecret : " + argv.githubClientSecret);
    console.log("argv.githubCallbackUrl  : " + argv.githubCallbackUrl);
    process.exit(1);

    startServer();
});

function startServer () {

    var options = {
        useGithubApp: ( typeof(argv.nonGithub) === 'undefined' ),
        github: {
            clientId: argv.githubClientId,
            clientSecret: argv.githubClientSecret,
            callbackUrl: argv.githubCallbackUrl
        }
    };

    const app = express();

    app.use(morgan('dev'));

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
