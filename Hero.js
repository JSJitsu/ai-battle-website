var Hero = function(x, y) {
  this.id = undefined;
  this.x = x;
  this.y = y;
  this.minesOwned = [];
  this.diamondsEarned = 0;
  this.health = 100;
  this.kills = 0;

  this.type = 'Hero';

};

Hero.prototype.getCode = function() {
  var idStr = this.id.toString();
  if (idStr.length === 1) {
    idStr = '0' + idStr;
  }
  return 'H' + idStr;
};

module.exports = Hero;