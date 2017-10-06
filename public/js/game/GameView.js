Backbone.View.extend({
    tagName: 'div',
    className: 'outer',
    gameSpeed: 500,
    events: {
        'click .play-pause-game': 'togglePlayGame',
        'click .restart-game': 'restartGame'
    },
    initialize: function (config) {
        var view = this;

        view.teamInfoViews = [];

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
        $('#replay .spinner').remove();
    },
    render: function () {
        var view = this,
            game = view.model.get('game'),
            $gameHtml = view.$el.find('.map');

        if (!view.boardView) {
            view.boardView = new BoardView({
                board: game.board
            });

            $gameHtml.html(view.boardView.$el);
            view.updateHeader();
        } else {
            view.boardView.board = game.board;
            view.boardView.render();
        }

        view.$el.find('.turn').text('Turn: ' + view.model.get('turn'));

        view.checkWinner();

        // Show game update messages
        var messageText = game.killMessage || game.attackMessage;
        var $messageEl = view.$('.messages');

        if (messageText) {
            $messageEl.css('opacity', 1);
            $messageEl.text(messageText);
        } else {
            var opacity = $messageEl.css('opacity');
            $messageEl.css('opacity', opacity - 0.2);
        }

        var teamConfigs = [
            {
                className: 'team-info t-blue',
                teamColor: 'Team Blue'
            },
            {
                className: 'team-info t-red',
                teamColor: 'Team Red'
            }
        ];

        // Add the team roster views for each team
        game.teams.forEach(function (team, index) {
            var teamView = view.teamInfoViews[index];
            if (!teamView) {
                teamView = view.teamInfoViews[index] = new TeamView({
                    className: teamConfigs[index].className,
                    collection: game.teams[index]
                });

                teamView.teamColor = teamConfigs[index].teamColor;
                teamView.diamonds = game.totalTeamDiamonds[index];

                teamView.render();
                $gameHtml.append(teamView.$el);
            } else {
                teamView.collection = game.teams[index];
                teamView.diamonds = game.totalTeamDiamonds[index];
                teamView.render();
            }
        });
    },
    renderControlArea: function () {
        var playControlsHtml,
            currentTurnHtml;

        playControlsHtml = [
            '<div class="row play-controls">',
            '  <span class="play-pause-game glyphicon glyphicon-play"></span>',
            '  <span class="restart-game glyphicon glyphicon-repeat"></span>',
            '</div>'
        ].join('');

        currentTurnHtml = '<span class="turn"></span>';

        this.$el.find('.slider').show();
        this.$el.append(playControlsHtml);
        this.$el.append(currentTurnHtml);
    },
    playNextTurn: function () {
        var view = this;

        this.model.nextTurn();

        view.render();
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
            maxTurn;

    // Get basic info about game state
        maxTurn = this.model.get('maxTurn');

    // Initialize new slider and set it to update
    // the turn on slide
        new Powerange(slider, {
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
        var game = this.model.get('game');
        var winner = game.winningTeam;
        var gameoverEl = $('.battle-map-message');

        if (game.ended) {
            if (winner === 1) {
                gameoverEl.text('Red Team Wins!').show();
            } else if (winner === 0) {
                gameoverEl.text('Blue Team Wins!').show();
            }
        } else {
            gameoverEl.hide();
        }
    },
    updateHeader: function () {
        var headerEl = $('.battle-header');
        var raw = this.model.get('raw');
        
        if (raw.latest) {
            headerEl.text('Today\'s Battle');
        } else {
            headerEl.text('Battle #' + raw.id);
        }
    }
});
