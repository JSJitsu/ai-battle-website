var BoardView = Backbone.View.extend({
  tagName: 'section',
  className: 'battle-map',
  initialize: function() {
    this.render();
  },
  render: function() {
    this.$el.html('');
    this.createBoardView();
  },
  createBoardView: function() {
  	var boardLength = this.collection.lengthOfSide;
    var $tr = $('<div class="tile-row">');
    // var models = this.collection.models;
    // for (var i = 0; i < this.collection.models.length; i++) {
    //   if (!i || (i % boardLength) === 0) {
    //     $tr = $('<div class="tile-row">'); 
    //   }
    //   var tileView = new BoardTileView({
    //     model: models[i]          
    //   });
    //   $tr.append(tileView.$el);
    //   if(i && (i % boardLength) === 0){
    //     this.$el.append($tr);
    //   }
    // }       
    for(var i = 0; i < boardLength; i++){
      var $tr = $('<div class="tile-row">');
    	for(var j = 0; j < boardLength; j++){
        var tileView = new BoardTileView({
    			model: this.collection.at(i * boardLength + j)          
    		});
    	  $tr.append(tileView.$el);
    	}
    	this.$el.append($tr);
    }
  }
});
