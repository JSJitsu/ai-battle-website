var express = require('express');
var fs = require('fs');
var Q = require('q');
var MongoClient = require('mongodb').MongoClient;
var OAuthGithub = require('./server/OAuthGithub');
var SafeMongoConnection = require('./server/SafeMongoConnection');
var helpers = require('./server/helpers');
var argv = require('minimist')(process.argv.slice(2));

var app = express();
var port = process.env.port || 8080;
var productionMode = process.env.PRODUCTION_MODE || 'local';
var secondsBetweenRefresh = process.env.SECONDS_BETWEEN_REFRESH || 120;
var mongoConnectionUrl = process.env.CUSTOMCONNSTR_MONGO_URI || 'mongodb://localhost/javascriptBattle';
var mongoOptions = {
  server: {
    socketOptions: {
      keepAlive: 1,
      connectTimeoutMS: 30000
    },
    auto_reconnect: true
  },
  replset: {
    socketOptions: {
      keepAlive: 1,
      connectTimeoutMS: 30000
    }
  }
};

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

var safeMongoConnection = new SafeMongoConnection(mongoConnectionUrl, mongoOptions);
safeMongoConnection.connect()
.done(
  // If all goes well, app starts after DB is connected
  function() {
    // Serve up files in public folder
    app.use('/', express.static(__dirname + '/public'));

    // must serve up ejs files individually for Azure to accept in deployment
    app.get('/ejs_templates/:ejsTemplate', function(req, res) {
      // file server
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(__dirname+'/public/ejs_templates/' +  req.params.ejsTemplate + '.ejs'));
    });

    // Add github authentication
    if (options.useGithubApp) {
      OAuthGithub(app, safeMongoConnection, options);
    }

    // The router for the API
    var router = express.Router();

    // Returns the state of the game on the given day and turn
    router.get('/gameDataForUser/', function(req, res) {
      var query = {};
      // Otherwise, use the most recent gameId of the user
      if (req.user && req.user.mostRecentGameId) {
        query = {
          _id: req.user.mostRecentGameId
        };
      }

      safeMongoConnection.safeInvoke('jsBattleGameData', 'findOne', query)
      .done(
        function(game) {
          res.status(200).send(game);
        },
        function(err) {
          res.status(500).send('Something went wrong!');
          throw err;
        }
      );
    });

    // Returns the leaderboard data for the specified time period and stat
    router.get('/leaderboard/:timePeriod/:stat', function(req, res) {
      var timePeriod = req.params.timePeriod;
      var stat = req.params.stat;
      var id = timePeriod + '|' + stat;

      // Get stat for leaderboard
      safeMongoConnection.safeInvoke('leaderboard', 'findOne', {
        '_id': id
      })
      // Return if success, throw err if failure
      .done(
        function(result) {
          res.status(200).send(result);
        },
        function(err) {
          res.status(500).send('Something went wrong!');
          throw err;
        }
      );
    });

    // // Returns the current announcement
    // router.get('/announcement', function(req, res) {
    //   safeMongoConnection.getConnection().then(function(db) {
    //     var collection = db.collection('general');
    //     return Q.ninvoke(collection, 'findOne', {
    //       'type': 'announcement'
    //     }).then(function(announcementData) {
    //       delete announcementData._id;
    //       res.json(announcementData);
    //     })
    //   }).catch(function(err) {
    //     res.send(err);
    //   });
    // });

    // Set root route for app's data
    app.use('/api', router);

    app.listen(port);

    console.log('Listening on port: ', port);
  },
  // If there is an error on DB connection, throw an error
  function(err) {
    throw err;
  }
);


// for ServerSpec.js to work must export app
module.exports = app;
