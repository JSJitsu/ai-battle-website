var HealthWell = function(distanceFromTop, distanceFromLeft) {
  this.distanceFromTop = distanceFromTop;
  this.distanceFromLeft = distanceFromLeft;

  this.type = 'HealthWell';

};

HealthWell.prototype.getCode = function() {
  return 'WWW';
};