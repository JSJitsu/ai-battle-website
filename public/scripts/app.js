
var app = {};
app.game = new Game();
app.gameView = new GameView({ model: app.game });
$('.container').append(app.gameView.$el);

