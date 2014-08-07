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
    var type = this.model.get('type');
    var teamId = this.model.get('team');
    if (subType !== 'Unoccupied') {
      var assets = {
        Tree: '../img/bush.png',
        Adventurer: '../img/bkknight.png',
        BlackKnight: '../img/black-knight.png',
        DiamondMine: '../img/diamond.png',
        HealthWell: '../img/pot.png',
        Bones: '../img/grave.png'
      };
      var html = '<img src="' + assets[subType] + '">';
        var colors = {
          0: "team-yellow",
          1: "team-blue"
        };
      if (type === 'Hero') {
        var gameTurn = this.model.get('gameTurn');
        var lastActiveTurn = this.model.get('lastActiveTurn')
        if(lastActiveTurn === (gameTurn - 1) && gameTurn !== 1){
          console.log(this.$el.innerHTML)
        }
        html = '<img src="' + assets[subType] + '" class="H' + this.model.get('battleId') +'">';
        
        html += '<div class="hero ' + colors[this.model.get('team')] +'">' + this.model.get('battleId') + '</div>';
      } else if (type === 'DiamondMine') {
        var owner = this.model.get('owner');
        if (owner) {
          html += '<div class="diamond-owner ' + colors[owner.team] +'">' + owner.id + '</div>';
        }
      }
      this.$el.html(html);
    }
  }
});