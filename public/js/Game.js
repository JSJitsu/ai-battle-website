
var Game = Backbone.Model.extend({
  url: 'api/gameData/0/1',
  initialize: function() {
  },
  
  parse: function(response) {
    this.set('turn', response.turn);
    this.set('diamondMessages', response.diamondMessage);
    this.set('moveMessages', response.moveMessage);
    this.set('attackMessages', response.attackMessage);
    this.set('killMessages', response.killMessage);
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
    this.url = '/api/gameData/0/' + turn;
  }
});