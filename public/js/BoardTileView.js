var BoardTileView = Backbone.View.extend({
  tagName: 'td',
  className: 'battle-tile',
  initialize: function(){
    if (this.model === undefined) {
      console.log('UNDEFINED!');
    }
    this.render();
    this.model.on('change', this.render());
  },
  render: function() {
    var type = this.model.get('type');
    if (type !== 'Unoccupied') {
      var assets = {
        Rock: '../img/bush.png',
        Hero: '../img/bkknight.png',
        DiamondMine: '../img/diamond.png',
        HealthWell: '../img/pot.png'
      };
      var html = '<img src="' + assets[type] + '">';
      if (type === 'Hero') {
        html += '<div class="hero">'+ this.model.get('battleId') + '</div>';
      }
      this.$el.html(html);
    }
  }
});