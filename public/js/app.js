var app = {};

app.navbar = new Navbar();
app.navbarView = new NavbarView({ model: app.navbar });
$('.navbar').append(app.navbarView.$el);

app.game = new Game();
app.gameView = new GameView({ model: app.game });
$('.gamegrid-content').append(app.gameView.$el);

app.user = new User();
app.userView = new UserView({ model: app.user });
$('#join').append(app.userView.$el);

