var GameView = Backbone.View.extend({
  tagName: 'div',
  className: 'game-view',
  initialize: function(){
    this.updateTurn(1);
    //what to operate on
    var source = $("#turn").html();
    //compiling handlebars
    this.template = Handlebars.compile(source);
  },

  render: function(){
  	this.$el.html('');
    this.$el.append('<p>' + this.model.get('diamondMessages') + '</p>').fadeIn();
    // this.el.append(this.model.get('messages'));
    this.context = {round: this.model.get('turn')};
  	var boardView = new BoardView({collection: this.model.get('board')});
    var html = this.template(this.context);
    this.$el.append(html);
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
