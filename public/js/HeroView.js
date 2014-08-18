var HeroView = Backbone.View.extend({
  className: 'list-group-item list-group-item-info score-info',
  tagName: 'li',
  initialize: function() {
    this.render();
  },
  render: function() {
    var heroId = this.model.get('battleId');
    var health = this.model.get('health');
    var name = this.model.get('name');
    var turn = this.model.get('gameTurn');
    var currentTurn = this.model.get('lastActiveTurn');

    if(health < 1){
      this.$el.removeClass('list-group-item-info').addClass('list-group-item-danger');
      health = 'Dead';
    } else{
      health =  health + 'HP';
    }
    var heroName = '<span class="hero-header h-i' + heroId + '">(id: ' + heroId + ') ' + name + ' </span>' + '<span class="health-info h-i' + heroId + '">' + health + '</span>';
    var divider = '<div class="divider"</div>'
    this.$el.append(heroName + divider);
    if(currentTurn === turn - 1 && turn !== 1){
      // this.$el.removeClass('list-group-item-info').addClass('list-group-item-highlighted');
    }
  }
});