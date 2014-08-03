var BoardTileView = Backbone.View.extend({
  tagName: 'td',
  className: 'battle-tile',
  initialize: function(){
  	this.render();
    if (this.model === undefined) {
      return;
    }
    this.model.on('change', this.render());
  },
  render: function() {
    if (this.model === undefined) {
      return;
    }
    if(!this.model.get('tile').type){
      return;
    }
    var tile = this.model.get('tile');
      var assets = {
        Impassable: "../resources/rock.jpg",
        Hero: "../resources/bknight.jpg",
        DiamondMine: "../resources/mine.jpg",
        HealthWell: '../resources/pot.png',
      } 
      this.$el.html('<img src="' + assets[tile.type] + '">');
    // if(this.assets[propertyCode.id.charAt(0)]){
      // var $icon = '<img src="' +this.assets[propertyCode.id.charAt(0)] + '">';
    //   if(propertyCode.id.charAt(0) === 'H'){
    //     $icon += '<div class="heroname">'+ "hero:" + propertyCode.id.charAt(3) + '</div>';
    //   }
    // }
  }
});