var Game = require('./game_classes/Game.js');
var fs = require('fs');

//Creates a board from the map in the given file path
var parser = function(mapFilePath){
  var buffer = fs.readFileSync(mapFilePath);
  map = buffer.toString('utf8');
  map = map.split('\n');
  for (var i = 0; i < map.length; i++){
    map[i] = map[i].split('|');
  }
  game = new Game(map.length);
  for (var j = 0; j < map.length; j++){
    for (var k = 0; k < map.length; k++){
      if (map[j][k] === 'DM'){
        game.addDiamondMine(j,k);
      } else if (map[j][k] === 'HW'){
        game.addHealthWell(j,k);
      } else if (map[j][k] === 'IM'){
        game.addImpassable(j,k);
      }
    }
  }
  return game;
};

module.exports = parser;
