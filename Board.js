var Board = function(length) {
  this.tiles = [];
  this.length = length;
  this.initializeBoard();
};

Board.prototype.inspect = function() {
  var horizontalDivide = '|';
  for (var i=0; i<this.length; i++) {
    var line = '|';
    for (var j=0; j<this.length; j++) {
      line += this.tiles[i][j] + '|';
      if (i === 0) {
        horizontalDivide += '-|';
      }
    }
    if (i === 0) {
      console.log(horizontalDivide);
    }
    console.log(line);
    console.log(horizontalDivide);
  }
};

Board.prototype.initializeBoard = function() {
  for (var i=0; i<this.length; i++) {
    this.tiles.push([]);
    for (var j=0; j<this.length; j++) {
      this.tiles[i].push('x');
    }
  }
};

module.exports = Board;