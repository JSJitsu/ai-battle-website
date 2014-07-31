var Hero = function(x, y) {
  this.id = undefined;
  this.x = x;
  this.y = y;
  this.minesOwned = [];
  this.diamondsEarned = 0;
  this.health = 100;
  this.kills = 0;
};

module.exports = Hero;