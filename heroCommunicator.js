var Q = require('q');


//Only used for local testing
moveFunctions = {
  0: function(gameData) {
    return 'West';    
  },
  1: function(gameData) {
    return 'East';
  },
  other: function(gameData) {
    var choices = ['North', 'South', 'East', 'West'];
    return choices[Math.floor(Math.random()*4)];
  }
}

var heroCommunicator = {};

heroCommunicator.getNextMove = function(hero, gameData) {
  //This will eventually be replaced with
  //the docker architecture
  var move = moveFunctions.other;

  if (moveFunctions.hasOwnProperty(hero.id)) {
    move = moveFunctions[hero.id];
  }

  return Q((function() {
    return move(gameData);
  })());
};


module.exports = heroCommunicator;