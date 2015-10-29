/* globals _,Backbone,$,BoardTileView */
/* exported BoardView */
var BoardView = Backbone.View.extend({
  tagName: 'section',
  className: 'battle-map',
  initialize: function (config) {
    this.board = config.board;
    this.render();
  },
  render: function() {
    this.$el.html('');
    this.createBoardView();
  },
  createBoardView: function() {
    var me = this,
        fragment = document.createDocumentFragment();

    _.each(this.board.tiles, function (tileRow) {
      var $tr = $('<div class="tile-row">');

      _.each(tileRow, function (tile) {
        var tileView;

        tileView = new BoardTileView({
          tile: tile
        });

        $tr.append(tileView.$el);
      });

      fragment.appendChild($tr[0]);
    });

    me.$el.append(fragment);
  }
});
