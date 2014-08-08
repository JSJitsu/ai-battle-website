var Board = require('./Board.js');
var Hero = require('./Hero.js');
var DiamondMine = require('./DiamondMine.js');
var Unoccupied = require('./Unoccupied.js');
var Impassable = require('./Impassable.js');
var HealthWell = require('./HealthWell.js');

var DIAMOND_MINE_CAPTURE_DAMAGE = 20;
var HERO_ATTACK_DAMAGE = 30;
var HEALTH_WELL_HEAL_AMOUNT = 40;

var Game = function(n) {
  this.board = new Board(n);

  this.heroes = [];
  this.heroTurnIndex = 0;
  this.activeHero = undefined;

  //Defaults to two teams currently
  this.teams = [[],[]];

  //General game object info
  this.diamondMines = [];
  this.healthWells = [];
  this.impassables = [];
  this.ended = false;

  //messages
  this.diamondMessage = '';
  this.moveMessage = 'Game is about to start';
  this.attackMessage = '';
  this.killMessage = '';

  //

  //Default is 300, can be overwritten
  this.maxTurn = 300;
  this.turn = 0;

  //Prevents adding of new objects
  //after game has started
  this.hasStarted = false;
};

// Adds a new hero to the board
// but ONLY if the game has not yet
// started
Game.prototype.addHero = function(distanceFromTop, distanceFromLeft, name, team) {
  if (this.hasStarted) {
    throw new Error('Cannot add heroes after the game has started!')
  }

  name = name || 'random';


  //Can only add a hero to unoccupied spaces
  if (this.board.tiles[distanceFromTop][distanceFromLeft].type === 'Unoccupied') {
    // Creates new hero object
    var hero = new Hero(distanceFromTop, distanceFromLeft, name, team);

    //First hero added is the active hero
    if (this.heroes.length === 0) {
      this.activeHero = hero;
    }

    // Saves hero id
    hero.id = this.heroes.length;

    // Puts hero on board
    this.board.tiles[distanceFromTop][distanceFromLeft] = hero;

    // Adds hero to game data structure
    this.heroes.push(hero);

    //Assign hero to appropriate team
    if (hero.team) {
      this.teams[hero.team].push(hero);

    //Adds hero to the smaller team if no team is specified
    } else if (this.teams[0].length <= this.teams[1].length) {
      hero.team = 0;
      this.teams[0].push(hero);
    } else {
      hero.team = 1;
      this.teams[1].push(hero);
    }

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

  if (this.turn > this.maxTurn) {
    this.ended = true;
  }
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

// Resolve diamond mine earnings
Game.prototype._handleHeroEarnings = function(hero) {
  if (hero.mineCount > 0) {
    this.diamondMessage = 'Hero #' + hero.id + ' got ' + hero.mineCount + ' diamonds from his mines';
  } else {
    this.diamondMessage = 'Hero #' + hero.id + ' owns no mines, and got no diamonds';
  }
  hero.diamondsEarned += hero.mineCount;
};

// Attempt to move hero in the direction indicated
Game.prototype._handleHeroMove = function(hero, direction) {
  this.moveMessage = 'Hero #' + hero.id + ' walked ' + direction;

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

    // Update hero location (in hero)
    hero.distanceFromTop = tile.distanceFromTop;
    hero.distanceFromLeft = tile.distanceFromLeft;

    // Update hero location (on board)
    this.board.tiles[hero.distanceFromTop][hero.distanceFromLeft] = hero;

  // If tile is a diamond mine, the mine is captured, but the hero stays put
  } else if (tile.type === "DiamondMine") {
    var diamondMine = tile;

    // Hero attempts to capture mine
    hero.captureMine(diamondMine, DIAMOND_MINE_CAPTURE_DAMAGE);

    // If capturing the mine takes the hero to 0 HP, he dies
    if (hero.dead) {
      this.heroDied(hero);
      this.moveMessage += ', tried to capture a diamond mine, but died fighting the mine guardians';
      return;

    // If he survives, he is now the owner of the mine
    } else {
      this.moveMessage += ' and is now the proud owner of diamond mine #' + diamondMine.id;
      diamondMine.owner = hero;
    }
  // Running into a health well will heal a certain amount of damage
  } else if (tile.type === "HealthWell") {
    this.moveMessage += ', drank from a health well, and now feels MUCH better';
    hero.healDamage(HEALTH_WELL_HEAL_AMOUNT);
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
          this.attackMessage === 'Hero #' + hero.id + ' stabbed Hero #' + otherHero.id;
        } else {
          this.attackMessage === 'and Hero #' + otherHero.id;
        }

        // Our hero (whose turn it is) will auto-hit any heroes in range,
        // so this other hero that is one space away will take damage
        hero.damageDone += otherHero.takeDamage(HERO_ATTACK_DAMAGE);
        if (otherHero.dead) {

          // Remove dead hero from the board
          this.heroDied(otherHero);

          // Tell our hero he killed someone
          hero.killedHero(otherHero);

          this.killMessage = 'Hero #' + hero.id + ' killed Hero #' + otherHero.id + '!';
        }
      }
    }
  }
};

// Removes a dead hero from the board
Game.prototype.heroDied = function(hero) {

  // Removes a dead hero from the board
  top = hero.distanceFromTop;
  left = hero.distanceFromLeft;
  var bones = new Unoccupied(top, left);
  bones.subType = 'Bones';
  this.board.tiles[top][left] = bones;
};

module.exports = Game;
