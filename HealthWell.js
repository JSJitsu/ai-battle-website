var HealthWell = function(distanceFromTop, distanceFromLeft) {
  this.distanceFromTop = distanceFromTop;
  this.distanceFromLeft = distanceFromLeft;

  this.type = 'HealthWell';
  this.class = 'HealthWell';

};

HealthWell.prototype.getCode = function() {
  return 'WWW';
};

module.exports = HealthWell;