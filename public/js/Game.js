
var Game = Backbone.Model.extend({
  url: 'api/gameData/1',
  initialize: function() {
  },
  
  parse: function(response) {
    this.set('turn', response.turn);

    var board = new Board();
    board.lengthOfSide = response.board.lengthOfSide;

    _.each(_.flatten(response.board.tiles), function(tileObject, key, list) {
      //The id from our game model was overwriting 
      tileObject.battleId = tileObject.id;
      delete tileObject.id;

      var tile = new BoardTile(tileObject);
      board.add(tile);
    });
    this.set('board', board);
  },
  updateTurn: function(turn) {
    this.url = '/api/gameData/' + turn;
  }
});