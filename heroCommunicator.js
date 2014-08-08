var Q = require('q');


//Only used for local testing
moveFunctions = {
  'miner': function(gameData) {
    return 'West';    
  },
  'assassin': function(gameData) {
    return 'East';
  },
  'coward': function(gameData) {
    return 'South';
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