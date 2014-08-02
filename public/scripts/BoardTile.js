var BoardTile = Backbone.Model.extend({
  initialize: function(tile) {
    this.set({tile: tile});
  }
});