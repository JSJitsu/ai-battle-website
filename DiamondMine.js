var DiamondMine = function(x, y) {
  this.id = undefined;

  //horizontal position, left to right
  this.x = x;

  //vertical position, top to bottom
  this.y = y;

  this.type = 'DiamondMine';

  this.owner = undefined;
};

DiamondMine.prototype.getCode = function() {
  var idStr = this.id.toString();
  if (idStr.length === 1) {
    idStr = '0' + idStr;
  }
  return 'D' + idStr;
};

module.exports = DiamondMine;
