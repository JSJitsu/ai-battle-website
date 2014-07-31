var Board = require('./Board.js');
var Hero = require('./Hero.js');
var DiamondMine = require('./DiamondMine.js');

var Game = function() {
  this.board = new Board(5);
  this.heros = [];
  this.diamondMines = [];
}

var runGame = function() {
  var board = new Board(5);
};

runGame();