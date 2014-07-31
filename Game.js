var Board = require('./Board.js');
var Hero = require('./Hero.js');
var DiamondMine = require('./DiamondMine.js');

var Game = function() {
  this.board = new Board(5);
  this.heros = [];
  this.diamondMines = [];
  this.turn = 1;
};

Game.prototype.addHero(x, y) {
  //Creates new hero object
  var hero = new Hero(x,y);

  //Saves hero id
  hero.id = this.heros.length;

  //Puts hero on board
  this.board.tiles[x][y] = hero;

  //Adds hero to game data structure
  this.heros.push(hero);
};

Game.prototype.addDiamondMine(x, y) {
  //Creates new diamond mine object
  var diamondMine = new DiamondMine(x,y);

  //Saves diamondMines id
  diamondMine.id = this.diamondMines.length;

  //Puts diamondMine on board
  this.board.tiles[x][y] = diamondMine;

  //Adds diamondMine to game data structure
  this.diamondMines.push(diamondMine);
};

Game.prototype.activeHero() {

};

var runGame = function() {
  var board = new Board(5);
};

runGame();