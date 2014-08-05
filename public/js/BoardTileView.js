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
    var class = this.model.get('class');
    if (class !== 'Unoccupied') {
      var assets = {
        Tree: '../img/bush.png',
        Adventurer: '../img/bkknight.png',
        BlackKnight: '../img/black-knight.png',
        DiamondMine: '../img/diamond.png',
        HealthWell: '../img/pot.png',
        Bones: '../img/bones.png';
      };
      var html = '<img src="' + assets[class] + '">';
      if (type === 'Hero') {
        html += '<div class="hero">'+ this.model.get('battleId') + '</div>';
      }
      this.$el.html(html);
    }
  }
});