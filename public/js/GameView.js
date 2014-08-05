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
    $('.messages').append(this.model.get('diamondMessages'));
    $('.messages').append('<br>' + this.model.get('attackMessages'));
    $('.messages').append('<br>' + this.model.get('killMessages'));
    // this.el.append(this.model.get('messages'));
    this.context = {round: this.model.get('turn')};
  	var boardView = new BoardView({collection: this.model.get('board')});
    var turnHtml = this.turnTemplate(this.context);
    this.$el.append(turnHtml);
    this.$el.append(boardView.$el);
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
