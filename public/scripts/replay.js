var GameTile = Backbone.Model.extend({
  initialize: function(value) {
    this.set({value: value});
  }
});
var GameBoard = Backbone.Collection.extend({
  model: GameTile,
  url: '/api/gameBoardData',
  parse: function(response) {
    var flatBoard = _.flatten(response.board.tiles);
    flatBoard = _.map(flatBoard, function(value, key, list) {
      return new GameTile(value);
    });
    return flatBoard;
  }
});
var GameTileView = Backbone.View.extend({

});

var GameBoardView = Backbone.View.extend({
  initialize: function() {
    this.collection.fetch();
    this.render();
  },
  render: function() {
    this.$el.append('Hi Jake and Greg!')
  }
});

window.app = {};
app.gameBoard = new GameBoard();
app.gameBoardView = new GameBoardView({ collection: app.gameBoard });

$('body').append(app.gameBoardView.$el)