var BoardTile = Backbone.Model.extend({
  initialize: function(value) {
    this.set({value: value});
  }
});