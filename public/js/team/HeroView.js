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

    if(health < 1){
      this.$el.removeClass('list-group-item-info').addClass('list-group-item-danger');
      health = 'Dead';
    } else{
      health =  health + 'HP';
    }
    var heroName = '<div class="hero-header h-i' + heroId + '">(id:' + heroId + ') ' + 
      '<a href="https://github.com/' + encodeURIComponent(name) + '/hero-starter">' + 
      name + '</a>' + ' </div>';
    var heroHP = '<div class="health-info h-i' + heroId + '">' + health + '</div>';
    this.$el.append(heroName + heroHP);
  }
});