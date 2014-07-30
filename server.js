var express = require('express');
var app = express();

var port = process.env.port || 8080;

// serve up files in public folder
app.use('/', express.static(__dirname + '/public'));

var router = express.Router();

router.get('/gameBoardData', function(req, res){
	var gameData = {};
  gameData.board = {};
  gameData.board.length = 5;
  gameData.board.tiles = [
	  [1,0,0,0,0],
	  [0,1,0,0,0],
	  [0,0,1,0,0],
	  [0,0,0,1,0],
	  [0,0,0,0,1]
  ];

	res.json(gameData);
});

app.use('/api', router);

app.listen(port);
console.log('Listening on port: ', port);