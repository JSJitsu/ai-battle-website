(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GameEngine = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (__dirname){
var fs = require('fs'),
    vm = require('vm');

var GameEngine = function(configs) {
  this.configs = this.buildConfigs(configs);
	this.board = require("./lib/game_classes/Board.js");
	this.diamondMine = require("./lib/game_classes/DiamondMine.js");
	this.game = require("./lib/game_classes/Game.js");
	this.healthWell = require("./lib/game_classes/HealthWell.js");
	this.hero = require("./lib/game_classes/Hero.js");
	this.impassable = require("./lib/game_classes/Impassable.js");
	this.unoccupied = require("./lib/game_classes/Unoccupied.js");
};

GameEngine.prototype.buildConfigs = function(configs) {
  var config,
      calculatedConfigs;

  calculatedConfigs = {
    boardSize: 12,
    maxUsersPerTeam: 12,
    maxTurns: 1250
  };

  for (config in configs) {
    if (configs.hasOwnProperty(config)) {
      calculatedConfigs[config] = configs[config];
    }
  }

  return  calculatedConfigs;
};

GameEngine.prototype.getBoard = function() {
	return this.board;
};

GameEngine.prototype.getDiamondMine = function() {
	return this.diamondMine;
};

GameEngine.prototype.getGame = function() {
	return this.game;
};

GameEngine.prototype.getHealthWell = function() {
	return this.healthWell;
};

GameEngine.prototype.getHero = function() {
	return this.hero;
};

GameEngine.prototype.getImpassable = function() {
	return this.impassable;
};

GameEngine.prototype.getUnoccupied = function() {
	return this.unoccupied;
};

//Creates a board from the map in the given file path
GameEngine.prototype.createGameFromMap = function(mapFilePath){
  var buffer = fs.readFileSync(mapFilePath),
      Game = this.getGame(),
      game;
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

/**
 * Synchronous, returns an array of all games that need
 * to be run and a lookup for finding user info
 * @param  {Object} originalUsers value is spliced upon creation
 * @return {Object}               Containing the games and userLookup
 */
GameEngine.prototype.planAllGames = function(originalUsers) {

  console.log('Planning games for ' + originalUsers.length + ' users.');

  var me = this,
      users = originalUsers.slice(),
      maxUsersPerTeam = me.configs.maxUsersPerTeam,
      boardSize = me.configs.boardSize,
      userLookup = {},
      games = [],
      numberOfGames = 0,
      alternateTeams = [],
      gameIndex = 0,
      map,
      game,
      currentGameIndex = 0,
      thisGame,
      thisTeam,
      nextUserIndex,
      nextUser;

  //Calculate number of games needed
  numberOfGames = Math.ceil(users.length / maxUsersPerTeam / 2);

  alternateTeams = [];

  //Create games
  for (gameIndex; gameIndex<numberOfGames; gameIndex++) {
    map = me.pickMap();
    game = me.createGameFromMap( __dirname + '/lib/maps/' + map );
    game.maxTurn = me.configs.maxTurns;
    games.push(game);

    //Keeps track of which team to add the
    //next hero to for each game
    //(Used below)
    alternateTeams.push(0);
  }


  //Add users to each game (one user to first game,
  //then move to next game and add a user, and so on
  //until all users have been added)

  while (users.length > 0) {
    thisGame = games[currentGameIndex];
    thisTeam = alternateTeams[currentGameIndex];

    //Next hero added to this game will be on the other team
    if (thisTeam === 0) {
      alternateTeams[currentGameIndex] = 1;
    } else {
      alternateTeams[currentGameIndex] = 0;
    }

    //Get a random user from the user list
    nextUserIndex = this.randomIndex(users.length);
    nextUser = users.splice(nextUserIndex, 1)[0];

    //Save the user (be able to get the hero port, etc later)
    var githubHandle = nextUser.github_login;
    userLookup[githubHandle] = nextUser;

    console.log('Adding user: ' + githubHandle + ' to game ' + currentGameIndex + ', team ' + thisTeam);

    //Loops through each game
    if (currentGameIndex < games.length - 1) {
      currentGameIndex++;
    } else {
      currentGameIndex = 0;
    }

    //Put hero at random location in the current game
    while (!thisGame.addHero(this.randomIndex(boardSize), this.randomIndex(boardSize), githubHandle, thisTeam)) {
      //Keep looping until the hero is successfully added
      //(Since we are choosing random locations, heroes that are added
      // onto occupied squares do nothing and return false, hence the loop)
    }
  }

  return {
    games: games,
    userLookup: userLookup
  };
};

// util methods

/**
 * Helper function for generating random indices
 * @param  {Number} maxExcl Max random number (exclusive)
 * @return {Number}         random number from 0 to max-1
 */
GameEngine.prototype.randomIndex = function(maxExcl) {
  return Math.floor(Math.random(Date.now()) * maxExcl);
};

GameEngine.prototype.pickMap = function() {
  var dir = __dirname + "/lib/maps/",
      maps = [];

  maps = fs.readdirSync(dir);

  if (Array.isArray(maps)) {
      map = maps[this.randomIndex(maps.length)];
      return map;
    } else {
      return maps;
    }
};


module.exports = GameEngine;
}).call(this,"/")
},{"./lib/game_classes/Board.js":2,"./lib/game_classes/DiamondMine.js":3,"./lib/game_classes/Game.js":4,"./lib/game_classes/HealthWell.js":5,"./lib/game_classes/Hero.js":6,"./lib/game_classes/Impassable.js":7,"./lib/game_classes/Unoccupied.js":8,"fs":9,"vm":11}],2:[function(require,module,exports){
var Unoccupied = require('./Unoccupied.js');

var Board = function(lengthOfSide) {
  this.tiles = [];
  this.lengthOfSide = lengthOfSide;
  this.initializeBoard();
};

Board.prototype.inspect = function() {
  var horizontalDivide = '|';
  for (var i=0; i<this.lengthOfSide; i++) {
    var line = '|';
    for (var j=0; j<this.lengthOfSide; j++) {
      line += this.tiles[i][j].getCode() + '|';
      if (i === 0) {
        horizontalDivide += '---|';
      }
    }
    if (i === 0) {
      console.log(horizontalDivide);
    }
    console.log(line);
    console.log(horizontalDivide);
  }
  console.log('********');
};

Board.prototype.initializeBoard = function() {
  for (var i=0; i<this.lengthOfSide; i++) {
    this.tiles.push([]);
    for (var j=0; j<this.lengthOfSide; j++) {
      this.tiles[i].push(new Unoccupied(i, j));
    }
  }
};

// Returns false if the given coordinates are out of range
Board.prototype.validCoordinates = function(distanceFromTop, distanceFromLeft) {
  return (!(distanceFromTop < 0 || distanceFromLeft < 0 || 
      distanceFromTop > this.lengthOfSide - 1 || distanceFromLeft > this.lengthOfSide - 1));
}

// Returns the tile [direction] (North, South, East, or West) of the given X/Y coordinate
Board.prototype.getTileNearby = function(distanceFromTop, distanceFromLeft, direction) {
  var fromTopNew = distanceFromTop;
  var fromLeftNew = distanceFromLeft;
  if (direction === 'North') {
    fromTopNew -= 1;
  } else if (direction === 'East') {
    fromLeftNew += 1;
  } else if (direction === 'South') {
    fromTopNew += 1;
  } else if (direction === 'West') {
    fromLeftNew -= 1;
  } else {
    return false;
  }

  if (this.validCoordinates(fromTopNew, fromLeftNew)) {
    return this.tiles[fromTopNew][fromLeftNew];
  } else {
    return false;
  }
};

module.exports = Board;
},{"./Unoccupied.js":8}],3:[function(require,module,exports){
var DiamondMine = function(distanceFromTop, distanceFromLeft) {
  this.id = undefined;

  this.distanceFromTop = distanceFromTop;
  this.distanceFromLeft = distanceFromLeft;

  this.type = 'DiamondMine';
  this.subType = 'DiamondMine';

  this.owner = undefined;
};

DiamondMine.prototype.getCode = function() {
  var idStr = this.id.toString();
  if (idStr.length === 1) {
    idStr = '0' + idStr;
  }
  return 'D' + idStr;
};

DiamondMine.prototype.updateOwner = function(hero) {
  if (this.owner !== undefined) {
    //Removes this mine from the previous owner's array
    this.owner.loseMine(this);
  }

  //Updates the owner to be the new hero
  this.owner = hero;
};

module.exports = DiamondMine;

},{}],4:[function(require,module,exports){
var Board = require('./Board.js');
var Hero = require('./Hero.js');
var DiamondMine = require('./DiamondMine.js');
var Unoccupied = require('./Unoccupied.js');
var Impassable = require('./Impassable.js');
var HealthWell = require('./HealthWell.js');

var DIAMOND_MINE_CAPTURE_DAMAGE = 20;
var HERO_ATTACK_DAMAGE = 20;
var HERO_FOCUSED_ATTACK_DAMAGE = 10;
var HEALTH_WELL_HEAL_AMOUNT = 30;
var HERO_HEAL_AMOUNT = 40;

var Game = function(n) {
  this.board = new Board(n);

  this.heroes = [];
  this.heroTurnIndex = 0;
  this.activeHero = undefined;

  //Defaults to two teams currently
  this.teams = [[],[]];
  this.totalTeamDiamonds = [0,0];

  //General game object info
  this.diamondMines = [];
  this.healthWells = [];
  this.impassables = [];
  this.ended = false;

  //Results
  this.winningTeam = undefined;

  //Messages
  this.diamondMessage = '';
  this.moveMessage = 'Game is about to start';
  this.attackMessage = '';
  this.killMessage = '';

  //Default is 300, can be overwritten
  this.maxTurn = 300;
  this.turn = 0;

  //Prevents adding of new objects
  //after game has started
  this.hasStarted = false;

  //Used in database retrieval
  this.date;
  this.gameNumber;
};

// Adds a new hero to the board
// but ONLY if the game has not yet
// started
Game.prototype.addHero = function(distanceFromTop, distanceFromLeft, name, team, id) {
  if (this.hasStarted) {
    throw new Error('Cannot add heroes after the game has started!')
  }

  //Can only add a hero to unoccupied spaces
  if (this.board.tiles[distanceFromTop][distanceFromLeft].type === 'Unoccupied') {
    // Creates new hero object
    var hero = new Hero(distanceFromTop, distanceFromLeft, name, team);

    //First hero added is the active hero
    if (id === 0 || this.heroes.length === 0) {
      this.activeHero = hero;
    }

    // Saves hero id
    if (id === 0 || id > 0) {
      hero.id = id;
    } else {
      hero.id = this.heroes.length;
    }

    // Puts hero on board
    this.board.tiles[distanceFromTop][distanceFromLeft] = hero;

    // Adds hero to game data structure
    this.heroes.push(hero);

    //Assign hero to appropriate team
    this.teams[hero.team].push(hero);

    //Makes it clear adding the hero was a success
    return true;
  } else {
    return false;
  }
};

// Adds a diamond mine to the board
Game.prototype.addDiamondMine = function(distanceFromTop, distanceFromLeft) {
  if (this.hasStarted) {
    throw new Error('Cannot add diamond mines after the game has started!')
  }

  //Can only add a diamond mine to unoccupied spaces
  if (this.board.tiles[distanceFromTop][distanceFromLeft].type === 'Unoccupied') {
    // Creates new diamond mine object
    var diamondMine = new DiamondMine(distanceFromTop, distanceFromLeft);

    // Saves diamondMines id
    diamondMine.id = this.diamondMines.length;

    // Puts diamondMine on board
    this.board.tiles[distanceFromTop][distanceFromLeft] = diamondMine;

    // Adds diamondMine to game data structure
    this.diamondMines.push(diamondMine);
  }
};

// Adds a health well to the board
Game.prototype.addHealthWell = function(distanceFromTop, distanceFromLeft) {
  if (this.hasStarted) {
    throw new Error('Cannot add health wells after the game has started!')
  }

  //Can only add a health well to unoccupied spaces
  if (this.board.tiles[distanceFromTop][distanceFromLeft].type === 'Unoccupied') {
    // Creates new health well object
    var healthWell = new HealthWell(distanceFromTop, distanceFromLeft);

    // Puts healthWell on board
    this.board.tiles[distanceFromTop][distanceFromLeft] = healthWell;

    // Adds healthWell to game data structure
    this.healthWells.push(healthWell);
  }
};

// Adds an impassable (rock, tree, etc) to the board
Game.prototype.addImpassable = function(distanceFromTop, distanceFromLeft) {
  if (this.hasStarted) {
    throw new Error('Cannot add impassables after the game has started!')
  }
  //Can only add an impassable to unoccupied spaces
  if (this.board.tiles[distanceFromTop][distanceFromLeft].type === 'Unoccupied') {
    // Creates new impassable object
    var impassable = new Impassable(distanceFromTop, distanceFromLeft);

    // Puts impassable on board
    this.board.tiles[distanceFromTop][distanceFromLeft] = impassable;

    // Adds impassable to game data structure
    this.impassables.push(impassable);
  }
};

// Resolves the hero's turn:
// 1) The active hero earns diamonds from each mine they own
//    at the start of their turn
// 2) Moves the active hero in the direction specified
Game.prototype.handleHeroTurn = function(direction) {
  if (this.ended) {
    return;
  }

  //Clear past messages
  this.diamondMessage = '';
  this.moveMessage = '';
  this.attackMessage = '';
  this.killMessage = '';

  this.hasStarted = true;

  var hero = this.activeHero;

  // Only resolves the turn if the hero is not dead
  if (!hero.dead) {
    //Used to determine which hero is "active" at each point in the game on the front-end
    hero.lastActiveTurn = this.turn;

    // Gives the hero diamonds for each owned mine
    this._handleHeroEarnings(hero);

    // Attempts to move the hero in the direction indicated
    this._handleHeroMove(hero, direction);

    // If hero died during this move phase...
    if (hero.dead) {
      // Remove hero from board
      this.heroDied(hero);

    // If hero is still alive after moving...
    } else {

      // Resolves all damage given and healing received at the
      // end of the hero's turn
      this._resolveHeroAttacks(hero);
    }
  } else {
    throw new Error('Dead heroes should never even have turns!');
  }

  //Increment the game turn and update the active hero
  this._incrementTurn();

  //Checks whether the game is over

  //Exceeded maximum turns
  if (this.turn >= this.maxTurn) {
    console.log('Game over. Maximum number of turns reached.');
    this.ended = true;
    var teamDiamonds0 = this._teamDiamonds(this.teams[0]);
    var teamDiamonds1 = this._teamDiamonds(this.teams[1]);
    if (teamDiamonds1 > teamDiamonds0) {
      this.winningTeam = 1;
    } else {
      this.winningTeam = 0;
    }
  //Team 0 are all dead
  } else if (this._teamIsDead(this.teams[0])) {
    console.log('Game over. Team 0 is dead.');
    this.winningTeam = 1;
    this.maxTurn = this.turn;
    this.ended = true;

  //Team 1 are all dead
  } else if (this._teamIsDead(this.teams[1])) {
    console.log('Game over. Team 1 is dead.');
    this.winningTeam = 0;
    this.maxTurn = this.turn;
    this.ended = true;
  }

  //Save the win or loss directly on the hero objects
  if (this.ended) {
    for (var i=0; i<this.heroes.length; i++) {
      var hero = this.heroes[i];
      if (hero.team === this.winningTeam) {
        hero.won = true;
      } else {
        hero.won = false;
      }
    }
  }
};


// Resolve diamond mine earnings
Game.prototype._handleHeroEarnings = function(hero) {
  if (hero.mineCount > 0) {
    this.diamondMessage = hero.name + ' got ' + hero.mineCount + ' diamonds from his mines';
  } else {
    this.diamondMessage = hero.name + ' owns no mines, and got no diamonds';
  }
  this.totalTeamDiamonds[hero.team] += hero.mineCount;
  hero.diamondsEarned += hero.mineCount;
};

// Attempt to move hero in the direction indicated
Game.prototype._handleHeroMove = function(hero, direction) {
  this.moveMessage = hero.name + ' walked ' + direction;

  // Gets the tile at the location that the hero wants to go to
  var tile = this.board.getTileNearby(hero.distanceFromTop, hero.distanceFromLeft, direction);

  // If tile is not on the board (invalid coordinates), don't move
  if (tile === false) {
    this.moveMessage += '...and realized that wasn\'t possible';
    return;

  // If tile is unoccupied, move into that tile
  } else if (tile.type === 'Unoccupied') {

    // Make the soon-to-be vacated tile "unoccupied"
    this.board.tiles[hero.distanceFromTop][hero.distanceFromLeft] =
        new Unoccupied(hero.distanceFromTop, hero.distanceFromLeft);

    //Check whether the hero robbed a grave, if so give credit
    if (tile.subType === 'Bones') {
      hero.gravesRobbed++;
    }

    // Update hero location (in hero)
    hero.distanceFromTop = tile.distanceFromTop;
    hero.distanceFromLeft = tile.distanceFromLeft;

    // Update hero location (on board)
    this.board.tiles[hero.distanceFromTop][hero.distanceFromLeft] = hero;

  // If tile is a diamond mine, the mine is captured, but the hero stays put
  } else if (tile.type === 'DiamondMine') {
    var diamondMine = tile;

    // Hero attempts to capture mine
    hero.captureMine(diamondMine, DIAMOND_MINE_CAPTURE_DAMAGE);

    // If capturing the mine takes the hero to 0 HP, he dies
    if (hero.dead) {
      this.heroDied(hero);
      this.moveMessage += ', and died trying to capture a diamond mine.';
      return;

    // If he survives, he is now the owner of the mine
    } else {
      this.moveMessage += ' and is now the proud owner of diamond mine #' + diamondMine.id;
      diamondMine.owner = hero;
    }
  // Running into a health well will heal a certain amount of damage
  } else if (tile.type === 'HealthWell') {
    this.moveMessage += ', drank from a health well, and now feels MUCH better';
    hero.healDamage(HEALTH_WELL_HEAL_AMOUNT);

  // Running into another hero will either heal them (same team) or hurt them (opposing team)
  } else if (tile.type === 'Hero') {
    var otherHero = tile;

    // Running directly into an enemy hero will deal extra damage
    if (otherHero.team !== hero.team) {
      this.moveMessage += ', and stabbed ' + otherHero.name + ' for extra damage';
      hero.damageDone += otherHero.takeDamage(HERO_FOCUSED_ATTACK_DAMAGE);

    // Running directly into a friendly hero will give the friendly hero health
    } else {
      this.moveMessage += ', and healed ' + otherHero.name;
      hero.healthGiven += otherHero.healDamage(HERO_HEAL_AMOUNT);
    }
  }
};

Game.prototype._resolveHeroAttacks = function(hero) {

  // Resolve Attacks and Healing (if any):
  var directions = [
    'North',
    'East',
    'South',
    'West',
  ];

  // Loop through all tiles around the hero
  for (var i=0; i<directions.length; i++) {
    var tile = this.board.getTileNearby(hero.distanceFromTop, hero.distanceFromLeft, directions[i]);
    if (tile === false) {

      // Does nothing if the tile in the given direction
      // Is not on the board
    } else if (tile.type === 'Hero') {

      // from the check above, we know 'tile' points to a hero object
      var otherHero = tile;

      // Only damage heroes that are not on your team

      if (otherHero.team !== hero.team) {

        // Update the attack message
        if (this.attackMessage === '') {
          this.attackMessage = hero.name + ' stabbed ' + otherHero.name;
        } else {
          this.attackMessage += ' and ' + otherHero.name;
        }

        // Our hero (whose turn it is) will auto-hit any heroes in range,
        // so this other hero that is one space away will take damage
        hero.damageDone += otherHero.takeDamage(HERO_ATTACK_DAMAGE);
        if (otherHero.dead) {

          // Remove dead hero from the board
          this.heroDied(otherHero);

          // Tell our hero he killed someone
          hero.killedHero(otherHero);

          this.killMessage = hero.name + ' killed ' + otherHero.name + '!';
        }
      }
    }
  }
};

Game.prototype._teamDiamonds = function(teamArray) {
  var diamonds = 0;
  for (var i=0; i<teamArray.length; i++) {
    diamonds += teamArray[i].diamondsEarned;
  }
  return diamonds;
};

Game.prototype._teamIsDead = function(teamArray) {
  for (var i=0; i<teamArray.length; i++) {
    if (!teamArray[i].dead) {
      return false;
    }
  }
  return true;
};

Game.prototype._incrementTurn = function() {

  //Used to determine whose turn it is
  var incrementHeroTurnIndex = function() {
    this.heroTurnIndex++;

    //If you reach the end of the hero list, start again
    if (this.heroTurnIndex >= this.heroes.length) {
      this.heroTurnIndex = 0;
    }
  }.bind(this);

  //Goes to next hero
  incrementHeroTurnIndex();

  //Make sure the next active hero is alive
  while (this.heroes[this.heroTurnIndex].dead) {
    incrementHeroTurnIndex();
  }

  //Set the active hero (the hero whose turn is next)
  this.activeHero = this.heroes[this.heroTurnIndex];

  //Increment the turn
  this.turn++;
};

// Removes a dead hero from the board
Game.prototype.heroDied = function(hero) {

  // Removes a dead hero from the board
  var top = hero.distanceFromTop;
  var left = hero.distanceFromLeft;
  var bones = new Unoccupied(top, left);
  bones.subType = 'Bones';
  this.board.tiles[top][left] = bones;
};

module.exports = Game;

},{"./Board.js":2,"./DiamondMine.js":3,"./HealthWell.js":5,"./Hero.js":6,"./Impassable.js":7,"./Unoccupied.js":8}],5:[function(require,module,exports){
var HealthWell = function(distanceFromTop, distanceFromLeft) {
  this.distanceFromTop = distanceFromTop;
  this.distanceFromLeft = distanceFromLeft;

  this.type = 'HealthWell';
  this.subType = 'HealthWell';

};

HealthWell.prototype.getCode = function() {
  return 'WWW';
};

module.exports = HealthWell;
},{}],6:[function(require,module,exports){
var Hero = function(distanceFromTop, distanceFromLeft, name, team) {
  this.id = undefined;

  // Location
  this.distanceFromTop = distanceFromTop;
  this.distanceFromLeft = distanceFromLeft;

  // Mines
  this.minesOwned = {};
  this.mineCount = 0;
  this.minesCaptured = 0;

  // Health
  this.health = 100;
  this.dead = false;

  // Stats
  this.diamondsEarned = 0;
  this.damageDone = 0;
  this.heroesKilled = [];
  this.lastActiveTurn = 0;
  this.gravesRobbed = 0;
  this.healthRecovered = 0;
  this.healthGiven = 0;

  // Results
  this.won = false;

  // General
  this.type = 'Hero';
  if (team === 0) {
    this.subType = 'BlackKnight';
  } else {
    this.subType = 'Adventurer';
  }
  this.team = team;

  //Personal
  this.name = name;
};

Hero.prototype.killedHero = function(otherHero) {
  this.heroesKilled.push(otherHero.id);
};

// Handles any situation in which the hero takes damage
// Returns the actual amount of damage taken
Hero.prototype.takeDamage = function(amount) {
  this.health -= amount;
  if (this.health <= 0) {
    this.dead = true;
    
    // Only return the damage actually needed
    // to kill this hero
    return amount + this.health;
  }

  // Return all the damage taken
  return amount;
};

// Handles any situation in which the hero heals damage
Hero.prototype.healDamage = function(amount) {
  var startingHealth = this.health;

  this.health += amount;
  if (this.health > 100) {
    this.health = 100;
  }

  //Stores stats
  var healthReceived = this.health - startingHealth;
  this.healthRecovered += healthReceived;

  //Returns the amount healed
  return healthReceived;
};

// Take control of a diamond mine
Hero.prototype.captureMine = function(diamondMine, healthCost) {
  // Make sure mine is not already owned
  if (this.minesOwned.hasOwnProperty(diamondMine.id)) {
    // If so, do nothing
  } else {
    this.takeDamage(healthCost);

    if (!this.dead) {
      // Add this mine to mines owned
      //(only stores id to prevent circular logic when saving to Mongo)
      this.minesOwned[diamondMine.id] = diamondMine.id;
      this.mineCount++;
      this.minesCaptured++;

      //Switch the diamond mine's owner to be this hero
      diamondMine.updateOwner(this);
    }
  }
};

// Lose control of a diamond mine
Hero.prototype.loseMine = function(diamondMine) {
  // If this hero actually owns the given mine
  if (this.minesOwned.hasOwnProperty(diamondMine.id)) {
    // Lose control of the mine
    this.mineCount--;
    delete this.minesOwned[diamondMine.id];
  }
};


Hero.prototype.getCode = function() {
  var idStr = this.id.toString();
  if (idStr.length === 1) {
    idStr = '0' + idStr;
  }
  return 'H' + idStr;
};

module.exports = Hero;
},{}],7:[function(require,module,exports){
var Impassable = function(distanceFromTop, distanceFromLeft) {
  this.id = undefined;
  this.type = 'Impassable';
  this.subType = 'Tree';
  this.distanceFromTop = distanceFromTop;
  this.distanceFromLeft = distanceFromLeft;
};

Impassable.prototype.getCode = function() {
  return 'III';
};

module.exports = Impassable;

},{}],8:[function(require,module,exports){
var Unoccupied = function(distanceFromTop, distanceFromLeft) {
  this.type = "Unoccupied";
  this.subType = "Unoccupied";
  this.distanceFromTop = distanceFromTop;
  this.distanceFromLeft = distanceFromLeft;
};

Unoccupied.prototype.getCode = function() {
  return '   ';
};

module.exports = Unoccupied;
},{}],9:[function(require,module,exports){

},{}],10:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],11:[function(require,module,exports){
var indexOf = require('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":10}]},{},[1])(1)
});