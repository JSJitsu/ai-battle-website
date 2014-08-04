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
        Rock: '../img/rock.jpg',
        Hero: '../img/black-knight.png',
        DiamondMine: '../img/mine.jpg',
        HealthWell: '../img/pot.png'
      }
      var html = '<img src="' + assets[type] + '">'
      if (type === 'Hero') {
        html += '<div class="heroname">'+ 'hero:' + this.model.get('battleId') + '</div>';
        html += '<div class="heroHp">'+ 'hp:' + this.model.get('health') + '</div>';
      }
      this.$el.html(html);
    }
  }
});