var helpers = {};

//Used in the gameData end point (below) 
helpers.getDateString = function(dayOffset) {
  if (dayOffset === undefined) {
    dayOffset = 0;
  }
  if (productionMode === 'production') {
    dayOffset -= 7/24;
  }
  var jsDate = new Date((new Date()).getTime() + dayOffset*24*60*60*1000);
  var result = (jsDate.getMonth() + 1).toString();
  result += '/' + jsDate.getDate();
  result += '/' + jsDate.getFullYear();
  return result;
};

module.exports = helpers;