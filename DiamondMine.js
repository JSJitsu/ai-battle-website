var DiamondMine = function(x, y) {
  this.id = undefined;

  //horizontal position, left to right
  this.x = x;

  //vertical position, top to bottom
  this.y = y;

  this.owner = undefined;
};

module.exports = DiamondMine;
