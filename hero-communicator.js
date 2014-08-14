var Q = require('q');
var helpers = require('./helpers.js');
var postToServerFunctions = require('./docker/post-to-server-functions.js');

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