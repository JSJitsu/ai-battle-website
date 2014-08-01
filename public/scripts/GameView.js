var GameView = Backbone.View.extend({
  tagName: 'div',
  className: 'game-view',
  initialize: function(){
    this.updateTurn(1);
  },

  render: function(){
  	var boardView = new BoardView({collection: this.model.get("board")});
    this.$el.append(boardView.$el);
    var source = $("#turn").html();
    var template = Handlebars.compile(source);
    var context = {round: this.model.get("turn")}
    var html = template(context);
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
