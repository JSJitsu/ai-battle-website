var Impassable = function(x, y) {
  this.id = undefined;
  this.type = "Rock";
  this.x = x;
  this.y = y;
};

Impassable.prototype.getCode = function() {
  return 'XXX';
};

module.exports = Impassable;
