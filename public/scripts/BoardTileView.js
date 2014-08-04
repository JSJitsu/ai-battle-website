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
      var $icon = '<img src="' + assets[tile.type] + '">'
      if(this.model.get('tile').type === "Hero"){
        console.log('hero detected')
        $icon += '<div class="heroname">'+ "hero:" + this.model.get('tile').id + '</div>';
      }
      this.$el.html($icon)
      

  }
});