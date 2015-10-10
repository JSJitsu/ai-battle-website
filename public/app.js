var app = {};

// Load user data
app.user = new User();
app.user.fetch();

app.game = new Game();
app.gameView = new GameView({
    model: app.game,
    userModel: app.user
});
$('.gamegrid-content').append(app.gameView.$el);

app.userView = new UserView({ model: app.user });
$('#join').append(app.userView.$el);

app.navbarView = new NavbarView({ model: app.user });
$('.navbar').append(app.navbarView.$el);

app.rulesView = new RulesView({ model: app.user });
$('#rules').append(app.rulesView.$el);

app.leaderboard = new Leaderboard();
app.leaderboardView = new LeaderboardView({ model: app.leaderboard });
$('#leaderboard div.container').append(app.leaderboardView.$el);