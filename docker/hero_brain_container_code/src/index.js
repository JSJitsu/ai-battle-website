var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();

//Placeholders for to-be-passed-in files
var move = function() { return 'Not yet loaded'; };
var helpers = {};


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/', function(req, res) {
  var result = move(req.body, helpers);
  res.json(result);
});

app.post('/heroFilesHere', multer({ 
  dest: './',
  rename: function() {
    return 'myHero';
  }
}), function(req, res) {
  move = require('./myHero.js');
  res.send("Hero file saved...probably");
});

app.post('/helperFilesHere', multer({ 
  dest: './',
  rename: function() {
    return 'helpers';
  }
}), function(req, res) {
  helpers = require('./helpers.js');
  res.send("Helper file saved...probably");
});

app.listen(8080);