var GameTile = Backbone.Model.extend({
  initialize: function(value) {
    this.set({value: value});
  }
});
var GameBoard = Backbone.Collection.extend({
  model: GameTile,
  url: '/api/gameBoardData',
  parse: function(response) {
  	this.boardLength = response.board.length;
    var flatBoard = _.flatten(response.board.tiles);
    flatBoard = _.map(flatBoard, function(value, key, list) {
      return new GameTile(value);
    });
    return flatBoard;
  }
});
var GameBoardTileView = Backbone.View.extend({
  tagName: 'td',
  initialize: function(){
  	this.$el.append(this.model.get('value'));
  }
});

var GameBoardView = Backbone.View.extend({
  tagName: 'table',
  initialize: function() {
    this.collection.fetch({
      success: this.createBoardView.bind(this),
      error: function(collection, response, options){
        console.log('something went wrong');
      }
    });
    this.render();
  },
  render: function() {
    this.$el.append('Hi Jake and Greg!');
  },
  createBoardView: function() {
  	var boardLength = this.collection.boardLength;
    for(var i = 0; i < boardLength; i++){
      var $tr = $('<tr>');
    	for(var j = 0; j < boardLength; j++){
    		var tileView = new GameBoardTileView({
    			model: this.collection.at(i * boardLength + j)
    		});
    	  $tr.append(tileView.$el);
    	}
    	this.$el.append($tr)
    }
  }
});

window.app = {};
app.gameBoard = new GameBoard();
app.gameBoardView = new GameBoardView({ collection: app.gameBoard });

$('body').append(app.gameBoardView.$el)