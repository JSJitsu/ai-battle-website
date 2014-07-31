var BoardView = Backbone.View.extend({
  tagName: 'table',
  className: 'battle-map',
  initialize: function() {
    $('#report').on('click',this.showReport.bind(this));
    this.updateTurn(1);
  },
  updateTurn: function(turn) {
    this.collection.updateTurn(turn); 
    this.collection.fetch({
      success: this.render.bind(this),
      error: function(collection, response, options){
        console.log('something went wrong');
      }
    });
  },
  render: function() {
    this.$el.html('');
    this.createBoardView();
  },
  createBoardView: function() {
  	var boardLength = this.collection.boardLength;
    for(var i = 0; i < boardLength; i++){
      var $tr = $('<tr>');
    	for(var j = 0; j < boardLength; j++){
    		var tileView = new BoardTileView({
    			model: this.collection.at(i * boardLength + j)          
    		});
    	  $tr.append(tileView.$el);
    	}
    	this.$el.append($tr);
    }
  },
  showReport: function(){
    this.$el.html('');
    $('.slide').hide();
  }
});
