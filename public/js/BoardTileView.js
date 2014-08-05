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
    var subType = this.model.get('subType');
    var type = this.model.get('type')
    if (subType !== 'Unoccupied') {
      var assets = {
        Tree: '../img/bush.png',
        Adventurer: '../img/bkknight.png',
        BlackKnight: '../img/black-knight.png',
        DiamondMine: '../img/diamond.png',
        HealthWell: '../img/pot.png',
        Bones: '../img/skull-crossbones.png'
      };
      var html = '<img src="' + assets[subType] + '">';
      if (type === 'Hero') {

        html += '<div class="hero">'+ this.model.get('battleId') + '</div>';
      }
      this.$el.html(html);
    }
  }
});