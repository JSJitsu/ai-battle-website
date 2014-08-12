var express = require('express');
var fs = require('fs');
var Q = require('q');
var MongoClient = require('mongodb').MongoClient;
var OAuthGithub = require('./server/OAuthGithub');

var app = express();
var port = process.env.port || 8080;
var productionMode = process.env.PRODUCTION_MODE || 'local';

// Defines mongo connection for azure deploy (or, failing that, for local deploy)
var mongoConnectionURL = process.env.CUSTOMCONNSTR_MONGOLAB_URI || 'mongodb://localhost/javascriptBattle';

// Connect to mongo
var openMongoCollection = Q.ninvoke(MongoClient, 'connect', mongoConnectionURL).then(function(db) {
  console.log('open!');
  return db.collection('jsBattleGameData');
});

// Serve up files in public folder
app.use('/', express.static(__dirname + '/public'));

app.get('/ejs_templates/notLoggedIn', function(req, res) {
  // file server
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(__dirname+'/public/ejs_templates/notLoggedIn.ejs'));
});

app.get('/ejs_templates/settings', function(req, res) {
  // file server
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(__dirname+'/public/ejs_templates/settings.ejs'));
});

app.get('/ejs_templates/lifetime', function(req, res) {
  // file server
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(__dirname+'/public/ejs_templates/lifetime.ejs'));
});

app.get('/ejs_templates/recent', function(req, res) {
  // file server
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(__dirname+'/public/ejs_templates/recent.ejs'));
});

app.get('/ejs_templates/average', function(req, res) {
  // file server
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(__dirname+'/public/ejs_templates/average.ejs'));
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
    //Server is 7 hours ahead
    dayOffset -= 7/24;
  }
  var jsDate = new Date((new Date()).getTime() + dayOffset*24*60*60*1000);
  var result = (jsDate.getMonth() + 1).toString();
  result += '/' + jsDate.getDate();
  result += '/' + jsDate.getFullYear();
  return result;
};

// Returns the state of the game on the given day and turn
// If dayOffset is -1, will get yesterday's data, if 0, will get today's data
router.get('/gameData/:dayOffset/:turn', function(req, res){
  openMongoCollection.then(function(collection) {
    collection.find({
      '_id':req.params.turn + '|' + getDateString(req.params.dayOffset)
    }).toArray(function(err,results) {
      if (err) {
        res.send(err);
      }
      res.send(results[0]);
    });
  }).catch(function(err) {
    //If something goes wrong, respond with error
    res.send(err);
  });
});

// Set root route for app's data
app.use('/api', router);

app.listen(port);

console.log('Listening on port: ', port);

// for ServerSpec.js to work must export app
module.exports = app;