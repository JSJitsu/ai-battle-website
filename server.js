var express = require('express');
var fs = require('fs');
var Q = require('q');
var Mongo = require('mongodb');
var MongoClient = Mongo.MongoClient;
var OAuthGithub = require('./server/OAuthGithub');
var JsBattleConnection = require('./server/JsBattleConnection');
var helpers = require('./server/helpers');

var app = express();
var port = process.env.port || 8080;
var productionMode = process.env.PRODUCTION_MODE || 'local';
var secondsBetweenRefresh = process.env.SECONDS_BETWEEN_REFRESH || 120;
var mongoConnectionUrl = process.env.CUSTOMCONNSTR_MONGO_URI || 'mongodb://localhost/javascriptBattle';

// Connection to database will refresh every 2 minutes (120 seconds)
var jsBattleConnection = new JsBattleConnection(mongoConnectionUrl, secondsBetweenRefresh);

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

  jsBattleConnection.getConnection().then(function(db) {
    var collection = db.collection('jsBattleGameData');
    return Q.ninvoke(collection, 'findOne', { 
      '_id': gameId
    }).then(function(game) {
      res.send(game);
    });
  }).catch(function(err) {
    res.send(err);
  });
});

// Returns the leaderboard data for the specified time period and stat
router.get('/leaderboard/:timePeriod/:stat', function(req, res) {
  var timePeriod = req.params.timePeriod;
  var stat = req.params.stat;

  jsBattleConnection.getConnection().then(function(db) {
    var collection = db.collection('leaderboard');
    var id = timePeriod + '|' + stat;
    collection.findOne({
      '_id': id
    }, function(err, results) {
      if (err) {
        res.send(err);
        return;
      }
      res.send(results);
    });
  }).catch(function(err) {
    //If something goes wrong, respond with error
    res.send(err);
  });
});

// Returns the current announcement
router.get('/announcement', function(req, res) {
  jsBattleConnection.getConnection().then(function(db) {
    var collection = db.collection('general');
    return Q.ninvoke(collection, 'findOne', {
      'type': 'announcement'
    }).then(function(announcementData) {
      res.send(announcementData.message);
    })
  }).catch(function(err) {
    res.send(err);
  });
});

// Set root route for app's data
app.use('/api', router);

app.listen(port);

console.log('Listening on port: ', port);

// for ServerSpec.js to work must export app
module.exports = app;