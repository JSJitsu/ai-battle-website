var express = require('express');
var fs = require('fs');
var Q = require('q');
var Mongo = require('mongodb');
var MongoClient = Mongo.MongoClient;
var OAuthGithub = require('./server/OAuthGithub');

var app = express();
var port = process.env.port || 8080;
var productionMode = process.env.PRODUCTION_MODE || 'local';

// Defines mongo connection for azure deploy (or, failing that, for local deploy)
var mongoConnectionURL = process.env.CUSTOMCONNSTR_MONGO_URI || 'mongodb://localhost/javascriptBattle';
var mongoConnectionOptions = {
  server: {
    socketOptions: {
      keepAlive: 1000
    },
    auto_reconnect: true
  }
};

// Connect to mongo
var openMongoDatabase = Q.ninvoke(MongoClient, 'connect', mongoConnectionURL, mongoConnectionOptions).then(function(db) {
  console.log('open!');
  return db;
});

// Serve up files in public folder
app.use('/', express.static(__dirname + '/public'));

// must serve up ejs files individually for Azure to accept in deployment
app.get('/ejs_templates/:ejsTemplate', function(req, res) {
  // file server
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(__dirname+'/public/ejs_templates/' +  req.params.ejsTemplate + '.ejs'));
});


// Add github authentication
OAuthGithub(app, mongoConnectionURL);

// The router for the API
var router = express.Router();

//Used in the gameData end point (below) 
var getDateString = function(dayOffset) {
  if (dayOffset === undefined) {
    dayOffset = 0;
  }
  if (productionMode === 'production') {
    dayOffset -= 7/24;
  }
  var jsDate = new Date((new Date()).getTime() + dayOffset*24*60*60*1000);
  var result = (jsDate.getMonth() + 1).toString();
  result += '/' + jsDate.getDate();
  result += '/' + jsDate.getFullYear();
  return result;
};

//Returns the leaderboard data for the specified time period and stat
router.get('/leaderboard/:timePeriod/:stat', function(req, res) {
  var timePeriod = req.params.timePeriod;
  var stat = req.params.stat;

  openMongoDatabase.then(function(db) {
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

// Returns the state of the game on the given day and turn
router.get('/gameDataForUser/:turn', function(req, res) {
  //If there is no user logged in, default to today's first game
  var gameId = '0|' + getDateString(0) + '|' + req.params.turn 

  //Otherwise, use the most recent gameId of the user
  if (req.user && req.user.mostRecentGameId) {
    gameId = req.user.mostRecentGameId + '|' + req.params.turn;
  }

  openMongoDatabase.then(function(db) {
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

// // Returns the state of the given game on the given day and turn
// // If dayOffset is -1, will get yesterday's data, if 0, will get today's data
// router.get('/gameData/:dayOffset/:turn/:gameIndex', function(req, res){
//   openMongoDatabase.then(function(db) {
//     var collection = db.collection('jsBattleGameData');
//     collection.find({
//       '_id': req.params.gameIndex + '|' + getDateString(req.params.dayOffset) + '|' + req.params.turn
//     }).toArray(function(err,results) {
//       if (err) {
//         res.send(err);
//         return;
//       }
//       res.send(results[0]);
//     });
//   }).catch(function(err) {
//     //If something goes wrong, respond with error
//     res.send(err);
//   });
// });

// Set root route for app's data
app.use('/api', router);

app.listen(port);

console.log('Listening on port: ', port);

// for ServerSpec.js to work must export app
module.exports = app;