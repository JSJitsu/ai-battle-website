var HeroView = Backbone.View.extend({
  className: 'list-group-item list-group-item-success',
  tagName: 'li',
  initialize: function() {
    this.render();
  },
  render: function() {
    var id = this.model.get('battleId');
    var health = this.model.get('health');
    var heroName = '<div class="hero-header H' + id + '">Hero:' + id + '</div>';
    var heroHP = '<div class="health-info H' + id + '">' + health + 'HP</div>';
    this.$el.append(heroName + heroHP);
      // for(var i = 0; i < heroesArray.length; i++){
    //   var hero = heroesArray[i];
    //   if(hero.health < 1){
    //     hero.health = '<span class="dead-info">Dead</span>';
    //   }
    //   else{
    //     hero.health = 'Health:' + hero.health + 'HP';
    //   }
    //   $('.hero-info').append('<div class="hero-header h-i' + hero.id + ' ">Hero: ' + hero.id + '</div>');
    //   $('.hero-info').append('<div class="health-info h-i' + hero.id + '"> ' + hero.health + '</div>');
    //   if(hero.lastActiveTurn === this.model.get('turn') - 1 && this.model.get('turn') !== 1){
    //     $('.H' + hero.id).parent().toggleClass('current-turn');
    //     $('.h-i' + hero.id).toggleClass('current-turn');
    //   }

      
    // }
  }
});