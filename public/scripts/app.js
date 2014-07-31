window.app = {};
app.gameBoard = new Board();
app.gameBoardView = new BoardView({ collection: app.gameBoard });

$('.container').append(app.gameBoardView.$el);
