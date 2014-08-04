var BoardView = Backbone.View.extend({
  tagName: 'table',
  className: 'battle-map',
  initialize: function() {
    this.render()
  },
  render: function() {
    this.$el.html('');
    this.createBoardView();
  },
  createBoardView: function() {
  	var boardLength = this.collection.lengthOfSide;
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
