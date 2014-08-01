var express = require('express');
var app = express();
var mongoose = require('mongoose');

var port = process.env.port || 8080;

//Defines mongo connection for azure deploy (or, failing that, for local deploy)
var mongooseConnectionURL = process.env.CUSTOMCONNSTR_MONGOLAB_URI || 'mongodb://localhost/javascriptBattle';
mongoose.connect(mongooseConnectionURL);

// serve up files in public folder
app.use('/', express.static(__dirname + '/public'));

// if ( !process.env.mode ) {
app.use('/tests', express.static(__dirname + '/test'));
// }

var router = express.Router();

router.get('/gameData/:turn', function(req, res){
	var gameData = {};
  gameData.board = {};
  gameData.board.lengthOfSide = 5;
  gameData.turn = req.params.turn;
  gameData.board.tiles = [
	  [req.params.turn,0,0,0,0],
	  [0,req.params.turn,0,0,0],
	  [0,0,req.params.turn,0,0],
	  [0,0,0,req.params.turn,0],
	  [0,0,0,0,req.params.turn]
  ];
  
  // respond with gameData in JSON format
	res.json(gameData);
});

// set root route for app's data
app.use('/api', router);

app.listen(port);
console.log('Listening on port: ', port);

// for ServerSpec.js to work must export app
module.exports = app;