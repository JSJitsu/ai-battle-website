var move = function(gameData, helpers) {
  var choices = ['North', 'East', 'South', 'West', 'Stay'];
  console.log(choices[Math.floor(Math.random()*5)]);
};

module.exports = move;