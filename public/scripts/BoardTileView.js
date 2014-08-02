var BoardTileView = Backbone.View.extend({
  tagName: 'td',
  className: 'battle-tile',
  initialize: function(){
    this.assets = {
      R: "../resources/rock.jpg",
      H: "../resources/bknight.jpg",
      D: "../resources/mine.jpg"
    } 
  	this.render();
    this.model.on('change', this.render());
  },
  render: function() {
    var propertyCode = this.model.get('value').charAt(0);
    if(this.assets[propertyCode]){
      var $icon = '<img src="' +this.assets[propertyCode] + '">';
      this.$el.html('TEST');
    }
  }
});