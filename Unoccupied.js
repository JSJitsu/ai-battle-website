var Unoccupied = function(x, y) {
  this.type = "Unoccupied";
  this.x = x;
  this.y = y;
};

Unoccupied.prototype.getCode = function() {
  return '   ';
};

module.exports = Unoccupied;