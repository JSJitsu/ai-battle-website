var app = {};

app.game = new Game();
app.gameView = new GameView({ model: app.game });
$('.gamegrid-content').append(app.gameView.$el);

app.user = new User();
app.userView = new UserView({ model: app.user });
$('#join').append(app.userView.$el);

app.navbarView = new NavbarView({ model: app.user });
$('.navbar').append(app.navbarView.$el);

app.rulesView = new RulesView({ model: app.user });
$('#rules').append(app.rulesView.$el);

app.leaderboard = new Leaderboard();
app.leaderboardView = new LeaderboardView({ model: app.leaderboard });
$('#leaderboard').append(app.leaderboardView.$el);
