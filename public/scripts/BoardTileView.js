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
    var tile = this.model.get('tile');
    var getIcon = function(code) {
      var assets = {
        R: "../resources/rock.jpg",
        H: "../resources/bknight.jpg",
        D: "../resources/mine.jpg",
        W: '../resources/pot.png',
      } 
      return '<img src="' + assets[code] + '">';
    };

    var $icon = '';
    if (tile.type === "Unoccupied") {
    } else if (tile.type === "Hero") {
      $icon = getIcon('H');
    } else if (tile.type === 'DiamondMine') {
      $icon = getIcon('D');
    } else if (tile.type === 'HealthWell') {
      $icon = getIcon('W');
    } else if (tile.type === 'Impassable') {
      $icon = getIcon('H');
    }
    this.$el.html($icon);
    // if(this.assets[propertyCode.id.charAt(0)]){
      // var $icon = '<img src="' +this.assets[propertyCode.id.charAt(0)] + '">';
    //   if(propertyCode.id.charAt(0) === 'H'){
    //     $icon += '<div class="heroname">'+ "hero:" + propertyCode.id.charAt(3) + '</div>';
    //   }
    // }
  }
});