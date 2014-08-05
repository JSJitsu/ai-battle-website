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
    $('.messages').append(this.model.get('diamondMessages'));
    $('.messages').append('<br>' + this.model.get('attackMessages'));
    $('.messages').append('<br>' + this.model.get('killMessages'));
    // this.el.append(this.model.get('messages'));
    this.context = {round: this.model.get('turn')};
  	var boardView = new BoardView({collection: this.model.get('board')});
    var turnHtml = this.turnTemplate(this.context);
    var heroesArray = this.model.get('heroes');
    this.$el.append(turnHtml);
    this.$el.append(boardView.$el);
    for(var i = 0; i < heroesArray.length; i++){
      if(heroesArray[i].health < 1){
        heroesArray[i].health = '<span style="color:red;">Dead</span>';
      }
      else{
        heroesArray[i].health = 'Health:' + heroesArray[i].health + 'HP';
      }
      $('.hero-info').append('<div class="hero-header">Hero: ' + heroesArray[i].id + '</div>');
      $('.hero-info').append('<div class="health-info"> ' + heroesArray[i].health + '</div>');
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
