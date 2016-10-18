var express = require('express');
var morgan = require('morgan');
var fs = require('fs');
var Q = require('q');

var OAuthGithub = require('./server/OAuthGithub');
var argv = require('minimist')(process.argv.slice(2));
var db = require('./database/connect.js');
var dbHelper = new (require('./database/helper.js'))(db);

var app = express();
app.use(morgan('dev'));
var port = process.env.PORT || 8080;

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
    return;
}

// Serve up files in public folder
app.use('/', express.static(__dirname + '/public'));

// must serve up ejs files individually for Azure to accept in deployment
app.get('/ejs_templates/:ejsTemplate', function (req, res) {
    // file server
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(__dirname+'/public/ejs_templates/' +  req.params.ejsTemplate + '.ejs'));
});

// Add github authentication
if (options.useGithubApp) {
    OAuthGithub(app, db, dbHelper, options);
}

// The router for the API
var router = express.Router();

// Returns the state of the latest game
router.get('/game(/:id)?', function (req, res) {
    var gameId = req.params.id,
        query;

    if (!gameId) {
        query = "SELECT * FROM game ORDER BY id DESC LIMIT 1";
    } else {
        query = `SELECT * FROM game WHERE id = ${gameId}`;
    }

    return Q.ninvoke(db, 'query', query)
        .then(function (games) {
            var game = games.shift();

            if (game) {
                return Q.ninvoke(db, 'query', `SELECT turn, actor, action FROM game_events WHERE game_id = ${game.id}`)
                    .then(function (gameEvents) {
                        game.events = gameEvents;
                        res.status(200).send(game);
                    });
            } else {
                res.status(200).send({
                    noData: true
                });
            }
        }
    );
});

// Returns the leaderboard data for the specified time period and stat
router.get('/leaderboard/:timePeriod/:stat', function (req, res) {

    var stat = req.params.stat;
    var allowedStats = {
        games_won: 'games_won',
        kills: 'kills',
        graves_taken: 'graves_taken',
        diamonds_earned: 'diamonds_earned',
        health_given: 'health_given'
    };

    var chosenStat = allowedStats[stat];

    if (!chosenStat) {
        res.status(404).send();
        return;
    }

    return Q.ninvoke(db, 'query', `SELECT * FROM player_lifetime_stats ORDER BY ${chosenStat} DESC LIMIT 20`)
        .then(function (stats) {
            if (stats) {
                res.status(200).send({
                    stats: stats
                });
            } else {
                res.status(404).send();
            }
        }
    );
});

// Set root route for app's data
app.use('/api', router);
app.listen(port);

console.log('Listening on port: ', port);

// for ServerSpec.js to work must export app
module.exports = app;
