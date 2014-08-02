var Impassable = function(distanceFromTop, distanceFromLeft) {
  this.id = undefined;
  this.type = "Rock";
  this.distanceFromTop = distanceFromTop;
  this.distanceFromLeft = distanceFromLeft;
};

Impassable.prototype.getCode = function() {
  return 'RRR';
};

module.exports = Impassable;
