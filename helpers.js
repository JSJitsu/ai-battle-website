var Game = require('./Game.js');

var helpers = {};

// Returns false if the given coordinates are out of range
helpers.validCoordinates = function(board, distanceFromTop, distanceFromLeft) {
  return (!(distanceFromTop < 0 || distanceFromLeft < 0 ||
      distanceFromTop > board.lengthOfSide - 1 || distanceFromLeft > board.lengthOfSide - 1));
};

// Returns the tile [direction] (North, South, East, or West) of the given X/Y coordinate
helpers.getTileNearby = function(board, distanceFromTop, distanceFromLeft, direction) {
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

  if (helpers.validCoordinates(board, fromTopNew, fromLeftNew)) {
    return board.tiles[fromTopNew][fromLeftNew];
  } else {
    return false;
  }
};

helpers.findNearestObjectDirectionAndDistance = function(fromTile, toTileType, board) {
  var queue = [];

  //Keeps track of places the fromTile has been
  var visited = {};
  // Variable assignments for fromTile's coordinates
  var dft = fromTile.distanceFromTop;
  var dfl = fromTile.distanceFromLeft;

  // Stores the coordinates, the direction fromTile is coming from, and it's location
  var visitInfo = [dft, dfl, 'None', 'START'];
  //Just a unique way of storing each location we've visited
  visited[dft + '|' + dfl] = true;
  // Push the starting tile on to the queue
  queue.push(visitInfo);

  // While the queue has a length
  while (queue.length > 0) {
    // Shift off first item in queue
    var coords = queue.shift();
    // Reset the coordinates to the shifted object's coordinates
    var dft = coords[0];
    var dfl = coords[1];

    // Loop through cardinal directions
    var directions = ['North', 'East', 'South', 'West'];
    for (var i = 0; i < directions.length; i++) {
      // For each of the cardinal directions get the next tile - use the getTileNearby helper method
      var direction = directions[i];
      var nextTile = helpers.getTileNearby(board, dft, dfl, direction);

      // If nextTile is a valid location to move...
      if (nextTile) {
        // Assign a key variable the nextTile's coordinates to put into our visited object later
        var key = nextTile.distanceFromTop + '|' + nextTile.distanceFromLeft;

        if (visited.hasOwnProperty(key)) {
          //Does nothing--this tile has already been visited
        } else if (nextTile.type === toTileType) {

          // This variable will eventually hold the first direction we went on this path
          var correctDirection = direction;
          var distance = 1;
          if (nextTile.health){
            var health = nextTile.health;
          }
          var finalCoords = [nextTile.distanceFromTop, nextTile.distanceFromLeft];

          // Loop back through path until we get to the start
          while (coords[3] !== 'START') {
            // Haven't found the start yet, so go to previous location
            correctDirection = coords[2];
            distance++;
            coords = coords[3];
          }

          //Return the first direction we went on this path
          return {
            direction: correctDirection,
            distance: distance,
            health: health,
            coords: finalCoords
          };

        } else if (nextTile.type === 'Unoccupied') {

          queue.push([nextTile.distanceFromTop, nextTile.distanceFromLeft, direction, coords]);
          // Give the visited object another key with the value we stored earlier
          visited[key] = true;
        }
      }
    }
  }
  // If we are blocked and there is no way to get where we want to go, return false
  return false;
};

helpers.findNearestDiamondMine = function(gameObj){
  return helpers.findNearestObjectDirectionAndDistance(gameObj.activeHero(), 'DiamondMine', gameObj.board).direction || false;
};

helpers.findNearestHealthWell = function(gameObj){
  return helpers.findNearestObjectDirectionAndDistance(gameObj.activeHero(), 'HealthWell', gameObj.board).direction || false;
};

helpers.findNearestEnemy = function(gameObj){
  return helpers.findNearestObjectDirectionAndDistance(gameObj.activeHero(), 'Hero', gameObj.board).direction || false;
};

helpers.findNearestEnemyWithLowHealth = function(gameObj, healthLevel){
  var fn = helpers.findNearestObjectDirectionAndDistance;
  if (fn(gameObj.activeHero(), 'Hero', gameObj.board).health <= healthLevel){
    return fn(gameObj.activeHero(), 'Hero', gameObj.board).direction;
  } else {
    var coords = fn(gameObj.activeHero(), 'Hero', gameObj.board).coords;
    gameObj.board.tiles[coords[0]][coords[1]] = null;
    return fn(gameObj.activeHero(), 'Hero', gameObj.board).direction;
  }
  return false;
};

var game = new Game(5);

game.addHero(1,2);
game.addHero(1,3);
game.addHero(4,4);
game.addDiamondMine(0,0);
game.heroes[2].health = 50;
game.heroes[1].health = 61;
game.board.inspect();

var dir = helpers.findNearestDiamondMine(game);
console.log(dir);
