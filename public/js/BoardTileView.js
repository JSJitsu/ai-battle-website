var BoardTileView = Backbone.View.extend({
  tagName: 'div',
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
      // var natureObjects = function(){
      //   var objects = [
      //     '../img/oak.png', 
      //     '../img/spruce.png', 
      //     '../img/tree2.png', 
      //     '../img/tree4.png'
      //   ];
      //   var randomObj = Math.floor(Math.random() * objects.length);
      //   return objects[randomObj];

      // };
      var assets = {
        Tree: '../img/tree.png',
        Adventurer: '../img/bkknight.png',
        BlackKnight: '../img/black-knight.png',
        DiamondMine: '../img/diamond.png',
        HealthWell: '../img/pot.png',
        Bones: '../img/grave.png'
      };
      var html = '<img src="' + assets[subType] + '" class="sprite">';
        var colors = {
          0: "team-yellow",
          1: "team-blue"
        };
      if (type === 'Hero') {
        var heroId = this.model.get('battleId');
        var HP = this.model.get('health');
        var gameTurn = this.model.get('gameTurn');
        var lastActiveTurn = this.model.get('lastActiveTurn')
        if(lastActiveTurn === (gameTurn - 1) && gameTurn !== 1){
          this.$el.addClass('current-turn');
        }
        html = '<img src="' + assets[subType] + '" id="H' + heroId +'" class="sprite">';
        
        html += '<div class="hero ' + colors[this.model.get('team')] +'">' + heroId + '</div>';
        html += '<div class="lifebar"><div class="life-capacity" style="height:' + HP + '%"></div></div>';
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