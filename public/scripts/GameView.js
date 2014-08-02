var GameView = Backbone.View.extend({
  tagName: 'div',
  className: 'game-view',
  initialize: function(){
    this.updateTurn(1);
    
  },

  render: function(){
  	this.$el.html('')
  	var boardView = new BoardView({collection: this.model.get("board")});
    var source = $("#turn").html();
    this.template = Handlebars.compile(source);
    this.context = {round: this.model.get("turn")}
    this.$el.append(boardView.$el);
    var html = this.template(this.context);
    this.$el.append(html);
  },
  updateTurn: function(turn) {
    this.model.updateTurn(turn); 
    this.model.fetch({
      success: this.render.bind(this),
      error: function(collection, response, options){
        console.log('something went wrong');
      }
    });
  }
});
