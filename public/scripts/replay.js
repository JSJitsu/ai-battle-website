var GameTile = Backbone.Model.extend({
  initialize: function(value) {
    this.set({value: value});
  }
});
var GameBoard = Backbone.Collection.extend({
  model: GameTile,
  turn: 1,
  url: '/api/gameBoardData/' + this.turn,
  updateTurn: function(turn) {
    this.turn = turn;
    this.url = '/api/gameBoardData/' + this.turn;
  },
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
  className: 'battle-tile',
  initialize: function(){
  	this.render();
    this.model.on('change', this.render());
  },
  render: function() {
    this.$el.html(this.model.get('value'));
  }
});

var GameBoardView = Backbone.View.extend({
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
    		var tileView = new GameBoardTileView({
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

window.app = {};
app.gameBoard = new GameBoard();
app.gameBoardView = new GameBoardView({ collection: app.gameBoard });

$('.container').append(app.gameBoardView.$el);
