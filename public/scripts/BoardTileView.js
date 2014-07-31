var BoardTileView = Backbone.View.extend({
  tagName: 'td',
  className: 'battle-tile',
  initialize: function(){
  	this.render();
    this.model.on('change', this.render());
  },
  render: function() {
    this.$el.html(this.model.get('value'));
  }
});