var BoardTileView = Backbone.View.extend({
  tagName: 'td',
  className: 'battle-tile',
  initialize: function(){
    this.assets = {
      R: "../resources/rock.jpg",
      H: "../resources/bknight.jpg",
      D: "../resources/mine.jpg",
      W: '../resources/pot.png',
    } 
  	this.render();
    this.model.on('change', this.render());
  },
  render: function() {
    var propertyCode = this.model.get('tile')
    if(this.assets[propertyCode.id.charAt(0)]){
      var $icon = '<img src="' +this.assets[propertyCode.id.charAt(0)] + '">';
      if(propertyCode.id.charAt(0) === 'H'){
        $icon += '<div class="heroname">'+ "hero:" + propertyCode.id.charAt(3) + '</div>';
      }
    }
  }
});