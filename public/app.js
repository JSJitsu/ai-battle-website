var app = {};

// Load user data
app.user = new User();
app.user.fetch();

app.game = new Game();

var fetchGameOpts = {
    success: function () {
        app.gameView = new GameView({
            model: app.game,
            userModel: app.user
        });

        $('.gamegrid-content').html(app.gameView.$el);
    }
};

router.addListenerAndTrigger('game/:id', function (id) {
    app.game.setGameId(id);
    app.game.fetch(fetchGameOpts);
});

app.userView = new UserView({ model: app.user });
$('#join').append(app.userView.$el);

app.navbarView = new NavbarView({ model: app.user });
$('.navbar').append(app.navbarView.$el);

app.rulesView = new RulesView({ model: app.user });
$('#rules').append(app.rulesView.$el);

app.leaderboard = new Leaderboard();
app.leaderboardView = new LeaderboardView({ model: app.leaderboard });
$('#leaderboard div.container').append(app.leaderboardView.$el);

new BattleList({ el: '.game-list' });