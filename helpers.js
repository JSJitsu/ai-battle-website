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
  var dft = fromTile.distanceFromTop;
  var dfl = fromTile.distanceFromLeft;

  var visitInfo = [dft, dfl, 'None', 'START'];
  //Just a unique way of storing each location we've visited
  visited[dft + '|' + dfl] = true;
  queue.push(visitInfo);

  while (queue.length > 0) {
    // shift off first item in queue
    var coords = queue.shift();
    var dft = coords[0];
    var dfl = coords[1];

    // loop through cardinal directions
    var directions = ['North', 'East', 'South', 'West'];
    for (var i = 0; i < directions.length; i++) {
      // for each of the cardinal directions get the next tile
      var direction = directions[i];
      var nextTile = helpers.getTileNearby(board, dft, dfl, direction);

      // if coords are valid, push on to queue
      if (nextTile) {
        // if this is our final destination, we found the shortest path!
        var key = nextTile.distanceFromTop + '|' + nextTile.distanceFromLeft;

        if (visited.hasOwnProperty(key)) {
          //Does nothing--this tile has already been visited
        } else if (nextTile.type === toTileType) {

          //This variable will eventually hold the first direction we went
          //on this path
          var correctDirection = direction;
          var distance = 1;

          //Loop back through path until we get to the start
          while (coords[3] !== 'START') {
            //Haven't found the start yet, so go to previous location
            correctDirection = coords[2];
            distance++;
            coords = coords[3];
          }

          //Return the first direction we went on this path
          return {
            direction: correctDirection,
            distance: distance
          };

        } else if (nextTile.type === 'Unoccupied') {
          queue.push([nextTile.distanceFromTop, nextTile.distanceFromLeft, direction, coords]);
          visited[key] = true;
        }
      }
    }
  }
  return false;
};


var game = new Game(5);

game.addHero(1,2);
game.addHero(2,2);
game.addHero(4,2);
game.addHero(4,4);
game.board.inspect();

var dir = helpers.findNearestObjectDirectionAndDistance(game.activeHero(), 'Hero', game.board);
console.log(dir);
