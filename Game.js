var Board = require('./Board.js');
var Hero = require('./Hero.js');
var DiamondMine = require('./DiamondMine.js');
var Unoccupied = require('./Unoccupied.js');
var Impassable = require('./Impassable.js');

var Game = function() {
  this.board = new Board(5);
  this.heroes = [];
  this.diamondMines = [];
  this.turn = 1;
  this.hasStarted = false;
};

//Adds a new hero to the board
//but ONLY if the game has not yet
//started
Game.prototype.addHero = function(x, y) {
  if (this.hasStarted) {
    throw new Error('Cannot add heroes after the game has started!')
  }

  //Creates new hero object
  var hero = new Hero(x,y);

  //Saves hero id
  hero.id = this.heroes.length;

  //Puts hero on board
  this.board.tiles[x][y] = hero;

  //Adds hero to game data structure
  this.heroes.push(hero);
};

//Adds a diamond mine to the board
Game.prototype.addDiamondMine = function(x, y) {
  if (this.hasStarted) {
    throw new Error('Cannot add diamond mines after the game has started!')
  }

  //Creates new diamond mine object
  var diamondMine = new DiamondMine(x,y);

  //Saves diamondMines id
  diamondMine.id = this.diamondMines.length;

  //Puts diamondMine on board
  this.board.tiles[x][y] = diamondMine;

  //Adds diamondMine to game data structure
  this.diamondMines.push(diamondMine);
};

//Return a reference to the hero whose turn it is
Game.prototype.activeHero = function() {
  var numHeroes = this.heroes.length;
  var activeIndex = this.turn % numHeroes;
  return this.heroes[activeIndex];
};

//Returns the tile [direction] (North, South, East, or West) of the given X/Y coordinate
Game.prototype.getTileNearby = function(startX, startY, direction) {
  var newX = startX;
  var newY = startY;
  if (direction === 'North') {
    newX -= 1;
  } else if (direction === 'East') {
    newY += 1;
  } else if (direction === 'South') {
    newX += 1;
  } else if (direction === 'West') {
    newY -= 1;
  }

  return this.board.tiles[newX][newY];
};

//Resolves the hero's turn:
//1) The active hero earns diamonds from each mine they own
//   at the start of their turn
//2) Moves the active hero in the direction specified
Game.prototype.handleHeroTurn = function(direction) {
  var hero = this.activeHero();

  //Resolve diamond mine earnings
  hero.diamondsEarned += hero.minesOwned.length;


  //Move Hero:
  //Gets the tile at the location that the hero wants to go to
  var tile = this.getTileNearby(hero.x, hero.y, direction);

  //Move the hero onto the new tile
  if (tile === undefined) {
    //Trying to move off end of board...does nothing
  } else if (tile.type === 'Unoccupied') {
    //Make the recently vacated tile "unoccupied"
    this.board.tiles[hero.x][hero.y] = new Unoccupied(hero.x, hero.y);
    hero.x = tile.x;
    hero.y = tile.y;
    this.board.tiles[hero.x][hero.y] = hero;
  } else {
    //Doesn't move because the path is blocked
  }

  //Resolve Attacks (if any):

  //Resolve Healing (if any):

  this.turn++;
};

var addGame = function() {
  var game = new Game();
  game.addHero(0,0);
  game.addHero(0,4);
  game.addHero(4,0);
  game.addHero(4,4);
  game.addDiamondMine(2,0);
  game.addDiamondMine(2,2);
  game.addDiamondMine(0,2);
  game.addDiamondMine(4,2);
  game.addDiamondMine(2,4);
  game.handleHeroTurn('South');
  game.board.inspect();
  console.log('*******');
  game.handleHeroTurn('East');
  game.handleHeroTurn('North');
  game.handleHeroTurn('South');
  game.handleHeroTurn('West');
  game.board.inspect();

};

addGame();