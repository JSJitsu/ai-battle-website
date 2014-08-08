var Q = require('q');


//Only used for local testing
moveFunctions = {
  'diamond': function(gameData) {
    return 'West';    
  },
  'kill': function(gameData) {
    return 'East';
  },
  'noname': function(gameData) {
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