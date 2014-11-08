var express = require('express');
var fs = require('fs');
var Q = require('q');
var MongoClient = require('mongodb').MongoClient;
var OAuthGithub = require('./server/OAuthGithub');
var SafeMongoConnection = require('./server/SafeMongoConnection');
var helpers = require('./server/helpers');

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
console.log(mongoConnectionUrl);
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
    OAuthGithub(app, mongoConnectionUrl);

    // The router for the API
    var router = express.Router();

    // Returns the state of the game on the given day and turn
    router.get('/gameDataForUser/:turn', function(req, res) {
      // If there is no user logged in, default to today's first game
      var gameId = '0|' + helpers.getDateString(0, productionMode) + '|' + req.params.turn 

      // Otherwise, use the most recent gameId of the user
      if (req.user && req.user.mostRecentGameId) {
        gameId = req.user.mostRecentGameId + '|' + req.params.turn;
      }

      safeMongoConnection.safeInvoke('jsBattleGameData', 'findOne', {
        '_id': gameId
      })
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