var GameView = Backbone.View.extend({
  tagName: 'div',
  className: 'game-view',
  initialize: function(){
    this.updateTurn(1);
    //what to operate on
    var turn = $("#turn").html();
    //compiling handlebars
    this.turnTemplate = Handlebars.compile(turn);
  },

  render: function(){
  	this.$el.html('');
    this.$el.append('<div class="messages"></div>');
    this.$el.append('<div class="hero-info"></div>')
    $('.messages').append(this.model.get('killMessages'));
    // this.el.append(this.model.get('messages'));
    this.context = {round: this.model.get('turn')};
  	var boardView = new BoardView({collection: this.model.get('board')});
    var turnHtml = this.turnTemplate(this.context);
    var heroesArray = this.model.get('heroes');
    this.$el.append(turnHtml);
    this.$el.append(boardView.$el);
    for(var i = 0; i < heroesArray.length; i++){
      var hero = heroesArray[i];
      if(hero.health < 1){
        hero.health = '<span class="dead-info">Dead</span>';
      }
      else{
        hero.health = 'Health:' + hero.health + 'HP';
      }
      $('.hero-info').append('<div class="hero-header h-i' + hero.id + ' ">Hero: ' + hero.id + '</div>');
      $('.hero-info').append('<div class="health-info h-i' + hero.id + '"> ' + hero.health + '</div>');
      if(hero.lastActiveTurn === this.model.get('turn') - 1 && this.model.get('turn') !== 1){
        $('.H' + hero.id).parent().toggleClass('current-turn');
        $('.h-i' + hero.id).toggleClass('current-turn');
      }

      
    }
  },
  updateTurn: function(turn) {
    this.model.updateTurn(turn); 
    this.model.fetch({
      success: this.render.bind(this),
      error: function(collection, response, options){
        console.log('error', response);
      }
    });
  }
});
