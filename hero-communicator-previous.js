var Q = require('q');
var helpers = require('./helpers.js');

//Only used for local testing
moveFunctions = {
  'miner': function(gameData) {
    if (gameData.activeHero.health < 50) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestUnownedDiamondMine(gameData);
    }
  },
  'assassin': function(gameData) {
    if (gameData.activeHero.health < 50) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestWeakerEnemy(gameData);
    }
  },
  'berserker': function(gameData) {
    if (gameData.activeHero.health < 30) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestEnemy(gameData);
    }
  },
  'coward': function(gameData) {
    return helpers.findNearestHealthWell(gameData);
  },
  'forrestbthomas': function(gameData) {
    return helpers.findNearestHealthWell(gameData);
  },
  'random': function(gameData) {
    var choices = ['North', 'South', 'East', 'West'];
    return choices[Math.floor(Math.random()*4)];
  }
}

var heroCommunicator = {};

heroCommunicator.getNextMove = function(hero, gameData) {
  //This will eventually be replaced with
  //the docker architecture
  var move = moveFunctions[hero.name];

  return Q((function() {
    return move(gameData);
  })());
};


module.exports = heroCommunicator;