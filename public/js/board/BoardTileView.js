var BoardTileView = Backbone.View.extend({
  tagName: 'div',
  className: 'battle-tile',
  initialize: function() {
    if (this.model === undefined) {
      console.log(undefined);
    }
    this.render();
    this.model.on('change', this.render());
  },
  render: function() {
    var subType = this.model.get('subType');
    var type = this.model.get('type');
    var teamId = this.model.get('team');
    if (subType !== 'Unoccupied') {
      var html = '<img src="' + gameAssets[subType] + '" class="sprite">';
        var colors = {
          0: "team-yellow",
          1: "team-blue"
        };
      if (type === 'Hero') {
        var name = this.model.get('name');
        var heroId = this.model.get('battleId');
        var HP = this.model.get('health');
        var gameTurn = this.model.get('gameTurn');
        var lastActiveTurn = this.model.get('lastActiveTurn');
        if(lastActiveTurn === (gameTurn - 1) && gameTurn !== 1){
          this.$('.sprite').addClass('current-turn');
        }
        html = '<img src="' + gameAssets[subType] + '" id="H' + heroId +'" class="sprite">';
        
        html += '<span class="indicator ' + colors[this.model.get('team')] +'">' + heroId + '</span>';
        html += '<span class="lifebar"><span class="life-capacity" style="height:' + HP + '%"></span></span>';
        this.$el.addClass('current-user-' + name);
      } else if (type === 'DiamondMine') {
        var owner = this.model.get('owner');
        if (owner) {
          html += '<span class="indicator ' + colors[owner.team] +'">' + owner.id + '</span>';
        } 
      }
      this.$el.html(html);
    }
  }
});