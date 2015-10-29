var GameView = Backbone.View.extend({
  tagName: 'div',
  className: 'outer',
  gameSpeed: 100,
  initialize: function (config) {
    var me = this;

    me.userModel = config.userModel;
    me.paused = true;
    me.playInProgress = false;
    me.sliderInitialized = false;
    me.initialLoad = true;

    me.$el.html('<div class="messages"></div>' + '<div class="row map"></div>');
    me.$el.append('<input class="row slider" style="visibility: hidden;">' + '</div>');

    $('#replay .spinner').hide();
    me.render();

    me.initializeSlider();

    me.renderControlArea();
  },
  events: {
    'click .play-pause-game': 'togglePlayGame',
    'click .restart-game': 'restartGame'
  },
  render: function() {
    var game = this.model.get('game'),
        $gameHtml = this.$el.find('.map'),
        boardView;

    boardView = new BoardView({
      board: game.board
    });

    $gameHtml.html(boardView.$el);

    this.$el.find('.turn').text('Turn: ' + game.turn);

    /*
    this.checkWinner();
    var $gameHtml = this.$el.find('.map');
    $gameHtml.html('');
    //Show game update messages
    $('.messages').text('');
    $('.messages').append(this.model.get('killMessages'));
       //Add html for team info
    */
    var yellowTeamView = new TeamView({
      collection: game.teams[1],
      className: 'team-info t-yellow',
    });
    yellowTeamView.teamColor = 'Team Yellow';
    yellowTeamView.diamonds = 0;
    yellowTeamView.render();

    var blueTeamView = new TeamView({
      collection: game.teams[0],
      className: 'team-info t-blue'
    });
    blueTeamView.teamColor = 'Team Blue';
    blueTeamView.diamonds = 0;
    blueTeamView.render();

    //Add all board html
    $gameHtml.append(yellowTeamView.$el);
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
  updateTurn: function (turn) {
    var view = this,
        userModel,
        currentUserHandle,
        heroAction;

    view.render();

    heroAction = this.translateEnumToAction(view.model.get('events')[turn][1]);
    this.model.get('game').handleHeroTurn(heroAction);

    userModel = view.userModel;
    currentUserHandle = userModel.get('githubHandle');

    if (currentUserHandle) {
      view.$el.find('.current-user-' + currentUserHandle).append('<span class="arrow"></span>');
    }
  },
  /**
   * @todo  Do this on the server side?
   */
  translateEnumToAction: function (enumerable) {
    var reversed = {},
        constants;

    constants = {
        North: 1,
        East: 2,
        South: 3,
        West: 4
    };

    for (var action in constants) {
        reversed[constants[action]] = action;
    }

    return reversed[enumerable];
  },
  sendSliderToTurn: function(turn) {
    //The "track" the sword slides along
    var $rangeBar = this.$el.find('.range-bar');

    //The sword element
    var $rangeHandle = $rangeBar.find('.range-handle');

    //The "filled-in" left-hand side of the track
    var $rangeQuantity = $rangeBar.find('.range-quantity')

    //Calculate how far into the game we are
    var maxTurn = this.model.get('maxTurn');
    var percentageComplete = turn / maxTurn;


    var convertCssLengthToNumber = function(str) {
      return +(str.slice(0,-2));
    };

    //Calculate where to put the slider and slider quantity
    var totalWidth = convertCssLengthToNumber($rangeBar.css('width'));
    var handleWidth = convertCssLengthToNumber($rangeHandle.css('width'));
    var actualWidth = totalWidth - handleWidth;
    var newHandleLocation = percentageComplete * actualWidth;

    //Put the range handle and range quantity in the correct location
    $rangeHandle.css('left', newHandleLocation + 'px');
    $rangeQuantity.css('width', newHandleLocation + 'px');
  },
  initializeSlider: function() {
    //Only run this function once...this ensures that
    if (!this.sliderInitialized) {
      this.sliderInitialized = true;
    } else {
      return;
    }

    //Get slider
    var $slider = this.$el.find('.slider'),
        slider = $slider[0],
        game = this.model.get('game'),
        currentTurn,
        maxTurn;

    //Get basic info about game state
    currentTurn = game.turn;
    maxTurn = this.model.get('maxTurn');

    //Initialize new slider and set it to update
    //the turn on slide
    var init = new Powerange(slider, {
      min: 0,
      max: maxTurn,
      callback: function() {
        //Pause the game
        this.pauseGame();

        //Slider value will range from the min to max
        // this.updateTurn(slider.value);

      }.bind(this)
    });

    //Allows users to change the turn with arrow keys
    $(document).keydown(function(e) {
      var turnAdjustment = 0;
      if (e.which === 39) {
        turnAdjustment = 1;
      } else if (e.which === 37) {
        turnAdjustment = -1;
      } else {
        //does nothing
        return;
      }

      //Will only get here if an arrow key is pressed
      //Pauses the game, then goes to the turn specified
      this.pauseGame();

      //Updates the turn
      var turn = this.model.get('turn');
      var maxTurn = this.model.get('maxTurn');

      //Adjusts the turn, but doesn't go below 0 or above the max turn
      var newTurn = Math.max(Math.min(turn + turnAdjustment, maxTurn),0);

      //Updates the model
      this.updateTurn(newTurn);

      //Send slider to new location
      this.sendSliderToTurn(newTurn);

    }.bind(this));
  },
  restartGame: function() {
    this.pauseGame();

    //Send slider and game to turn 0
    $.when(this.updateTurn(0)).then(function() {
      this.sendSliderToTurn(0);
    }.bind(this));
  },
  pauseGame: function() {
    this.paused = true;

    clearInterval(this.tickTimer);

    //Change pause button to a play button
    var $playPause = this.$el.find('.play-pause-game');
    $playPause.removeClass('glyphicon-pause');
    $playPause.addClass('glyphicon-play');
  },
  togglePlayGame: function() {
    this.paused = !this.paused;
    var $playPause = this.$el.find('.play-pause-game');
    if (this.paused) {
      //Change pause button to a play button
      $playPause.removeClass('glyphicon-pause');
      $playPause.addClass('glyphicon-play');

      this.pauseGame();
    } else {
      //Change play button to a pause button
      $playPause.removeClass('glyphicon-play');
      $playPause.addClass('glyphicon-pause');

      //Start auto-playing the game
      this.paused = false;
      this.autoPlayGame();
    }
  },
  autoPlayGame: function() {
    //Store the current turn and the turn at which
    //the game will end
    var game = this.model.get('game');
    var currTurn = game.turn;
    var maxTurn = this.model.get('maxTurn');

    //If the game is not yet over, go to next turn
    if (currTurn < maxTurn && this.paused === false && this.playInProgress === false) {
      //Keeps track of whether we are waiting for the promise
      //to resolve (used to prevent issues with users doubleclicking)
      //the play button

      this.tickTimer = setInterval(function () {
        var turn = game.turn;

        this.playInProgress = true;
        this.updateTurn(turn + 1);
        this.sendSliderToTurn(currTurn + 1);

        this.playInProgress = false;
      }.bind(this), this.gameSpeed);

      console.warn('Auto-play timer started:', this.tickTimer);
    } else {
      clearInterval(this.tickTimer);
      console.info('Auto-play timer stopped:', this.tickTimer);
    }
  },
  checkWinner: function() {
    var winner = this.model.get('winningTeam');
    var message = $('.winner-msg');
    if (winner === 0) {
      message.text('Yellow Team Wins!');
    } else if (winner === 1) {
      message.text('Blue Team Wins!');

    } else {
      message.text('See Today\'s Battle')
    }
  }
});
