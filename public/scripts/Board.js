var Board = Backbone.Collection.extend({
  model: BoardTile,
  turn: 1,
  url: '/api/gameData/' + this.turn,
  updateTurn: function(turn) {
    this.turn = turn;
    this.url = '/api/gameData/' + this.turn;
  },
  parse: function(response) {
  	this.boardLength = response.board.length;
    var flatBoard = _.flatten(response.board.tiles);

    flatBoard = _.map(flatBoard, function(value, key, list) {
      return new BoardTile(value);
    });

    return flatBoard;
  }
});