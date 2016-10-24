var GameView = Backbone.View.extend({
    tagName: 'div',
    className: 'outer',
    gameSpeed: 500,
    events: {
        'click .play-pause-game': 'togglePlayGame',
        'click .restart-game': 'restartGame'
    },
    initialize: function (config) {
        var view = this;

        if (view.model.get('noGameData')) {
            view.renderError();
        } else {
            view.renderGame(config);
        }

        view.onAfterInitialize();
    },
    renderError: function () {
        $('#replay').removeClass('battle-space');

        this.$el.removeClass('outer');
        this.$el.addClass('text-center');
        this.$el.html("<h3>We weren't able to load the battle.</h3>");
    },
    renderGame: function (config) {
        var view = this;

        view.userModel = config.userModel;
        view.paused = true;
        view.playInProgress = false;
        view.sliderInitialized = false;
        view.initialLoad = true;

        view.$el.html('<div class="messages"></div>' + '<div class="row map"></div>');
        view.$el.append('<input class="row slider" style="visibility: hidden;">' + '</div>');

        view.render();

        view.initializeSlider();

        view.renderControlArea();
    },
    onAfterInitialize: function () {
        $('#replay .spinner').hide();
    },
    render: function () {
        var game = this.model.get('game'),
            $gameHtml = this.$el.find('.map'),
            boardView;

        boardView = new BoardView({
            board: game.board
        });

        $gameHtml.html(boardView.$el);

        this.$el.find('.turn').text('Turn: ' + this.model.get('turn'));

        this.checkWinner();

    // Show game update messages
        $('.messages').text(game.killMessage || game.attackMessage);

    // Add html for team info
        var redTeamView = new TeamView({
            collection: game.teams[1],
            className: 'team-info t-red',
        });
        redTeamView.teamColor = 'Team Red';
        redTeamView.diamonds = game.totalTeamDiamonds[1];
        redTeamView.render();

        var blueTeamView = new TeamView({
            collection: game.teams[0],
            className: 'team-info t-blue'
        });
        blueTeamView.teamColor = 'Team Blue';
        blueTeamView.diamonds = game.totalTeamDiamonds[0];
        blueTeamView.render();

    // Add all board html
        $gameHtml.append(redTeamView.$el);
        $gameHtml.append(blueTeamView.$el);
    },
    renderControlArea: function () {
        var playControlsHtml,
            currentTurnHtml,
            gameTipsHtml;

        playControlsHtml = [
            '<div class="row play-controls">',
            '  <span class="play-pause-game glyphicon glyphicon-play"></span>',
            '  <span class="restart-game glyphicon glyphicon-repeat"></span>',
            '</div>'
        ].join('');

        currentTurnHtml = '<span class="turn"></span>';

        gameTipsHtml = [
            '<div class="game-tips">',
            '  <aside title="Click to hide" class="game-tips">',
            '    <div class="row">',
            '      <div class="col-lg-12 text-center">',
            '        <i class="hide-tip fa fa-times"></i>',
            '        Hero not doing anything? Make sure to check your code for endless loops and errors!',
            '      </div>',
            '    </div>',
            '    <div class="row">',
            '      <div class="col-lg-12 text-center">',
            '        Can\'t see your hero? Don\'t forget to login!',
            '      </div>',
            '    </div> ',
            '  </aside>',
            '</div>'
        ].join('');

        this.$el.find('.slider').show();
        this.$el.append(playControlsHtml);
        this.$el.append(currentTurnHtml);
        this.$el.append(gameTipsHtml);
    },
    playNextTurn: function () {
        var view = this,
            userModel,
            currentUserHandle;

        this.model.nextTurn();

        view.render();

        userModel = view.userModel;
        currentUserHandle = userModel.get('github_login');

        if (currentUserHandle) {
            view.$el.find('.current-user-' + currentUserHandle).append('<span class="arrow"></span>');
        }
    },
    sendSliderToTurn: function (turn) {
    // The "track" the sword slides along
        var $rangeBar = this.$el.find('.range-bar');

    // The sword element
        var $rangeHandle = $rangeBar.find('.range-handle');

    // The "filled-in" left-hand side of the track
        var $rangeQuantity = $rangeBar.find('.range-quantity');

    // Calculate how far into the game we are
        var maxTurn = this.model.get('maxTurn');
        var percentageComplete = turn / maxTurn;


        var convertCssLengthToNumber = function (str) {
            return +(str.slice(0,-2));
        };

    // Calculate where to put the slider and slider quantity
        var totalWidth = convertCssLengthToNumber($rangeBar.css('width'));
        var handleWidth = convertCssLengthToNumber($rangeHandle.css('width'));
        var actualWidth = totalWidth - handleWidth;
        var newHandleLocation = percentageComplete * actualWidth;

    // Put the range handle and range quantity in the correct location
        $rangeHandle.css('left', newHandleLocation + 'px');
        $rangeQuantity.css('width', newHandleLocation + 'px');
    },
    initializeSlider: function () {
    // Only run this function once...this ensures that
        if (!this.sliderInitialized) {
            this.sliderInitialized = true;
        } else {
            return;
        }

    // Get slider
        var $slider = this.$el.find('.slider'),
            slider = $slider[0],
            game = this.model.get('game'),
            currentTurn,
            maxTurn;

    // Get basic info about game state
        currentTurn = game.turn;
        maxTurn = this.model.get('maxTurn');

    // Initialize new slider and set it to update
    // the turn on slide
        var init = new Powerange(slider, {
            min: 0,
            max: maxTurn,
            callback: function () {
        // Pause the game
                this.pauseGame();

        // Slider value will range from the min to max
                this.model.jumpToTurn(slider.value);
                this.render();

            }.bind(this)
        });

    // Allows users to change the turn with arrow keys
        $(document).keydown(function (e) {
            var turnAdjustment = 0;
            if (e.which === 39) {
                turnAdjustment = 1;
            } else if (e.which === 37) {
                turnAdjustment = -1;
            } else {
        // does nothing
                return;
            }

      // Will only get here if an arrow key is pressed
      // Pauses the game, then goes to the turn specified
            this.pauseGame();

      // Updates the turn
            var turn = this.model.get('game').turn;
            this.jumpToGameTurn(turn + turnAdjustment);

        }.bind(this));
    },
    jumpToGameTurn: function (turn) {
        this.model.jumpToTurn(turn);
        this.sendSliderToTurn(turn);
        this.render();
    },
    restartGame: function () {
        this.pauseGame();

    // Send slider and game to turn 0
        this.jumpToGameTurn(0);
    },
    pauseGame: function () {
        this.paused = true;

        clearInterval(this.tickTimer);

    // Change pause button to a play button
        var $playPause = this.$el.find('.play-pause-game');
        $playPause.removeClass('glyphicon-pause');
        $playPause.addClass('glyphicon-play');
    },
    togglePlayGame: function () {
        this.paused = !this.paused;
        var $playPause = this.$el.find('.play-pause-game');
        if (this.paused) {
      // Change pause button to a play button
            $playPause.removeClass('glyphicon-pause');
            $playPause.addClass('glyphicon-play');

            this.pauseGame();
        } else {
      // Change play button to a pause button
            $playPause.removeClass('glyphicon-play');
            $playPause.addClass('glyphicon-pause');

      // Start auto-playing the game
            this.paused = false;
            this.autoPlayGame();
        }
    },
    autoPlayGame: function () {
    // Store the current turn and the turn at which
    // the game will end
        var game = this.model.get('game');

    // If the game is not yet over, go to next turn
        if (!game.ended && this.paused === false && this.playInProgress === false) {
            this.tickTimer = setInterval(function () {
                if (game.ended) {
                    clearInterval(this.tickTimer);
                } else {
                    this.playInProgress = true;
                    this.playNextTurn();
                    this.sendSliderToTurn(game.turn);

                    this.playInProgress = false;
                }
            }.bind(this), this.gameSpeed);

            console.warn('Auto-play timer started:', this.tickTimer);
        } else {
            clearInterval(this.tickTimer);
            console.info('Auto-play timer stopped:', this.tickTimer);
        }
    },
    checkWinner: function () {
        var winner = this.model.get('game').winningTeam;
        var message = $('.winner-msg');
        if (winner === 1) {
            message.text('Red Team Wins!');
        } else if (winner === 0) {
            message.text('Blue Team Wins!');
        } else {
            message.text('Today\'s Battle');
        }
    }
});
