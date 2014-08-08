var GameView = Backbone.View.extend({
  tagName: 'div',
  className: 'game-view-outer',
  initialize: function(){
    this.updateTurn(0);
    this.playSrc = 'http://icons.iconarchive.com/icons/hopstarter/button/256/Button-Play-icon.png';
    this.pauseSrc = 'http://icons.iconarchive.com/icons/hopstarter/button/256/Button-Pause-icon.png';
    this.paused = true;
    this.playInProgress = false;

    this.$el.html('<div class="game-view"></div>');
    // this.$el.append('<div class="game-scroller">' +
    //                   '<span class="play-pause-game glyphicon glyphicon-play">' +
    //                   '</span>' +
    //                   '<span class="restart-game glyphicon glyphicon-repeat">' +
    //                   '</span>' +
    //                 '</div>');
    this.$el.append('<div class="play-controls">' +
                      '<span class="play-pause-game glyphicon glyphicon-play">' +
                      '</span>' +
                      '<span class="restart-game glyphicon glyphicon-repeat">' +
                      '</span>' +
                    '</div>');

    //what to operate on
    // var turn = $("#turn").html();
    //compiling handlebars
    // this.turnTemplate = Handlebars.compile(turn);
  },
  events: {
    'click .play-pause-game': 'togglePlayGame',
    'click .restart-game': 'restartGame'
  },
  render: function(){
  	var $gameHtml = this.$el.find('.game-view');
    $gameHtml.html('');

    //Show game update messages
    $gameHtml.append('<div class="messages"></div>');
    $('.messages').append(this.model.get('killMessages'));
       //Add html for team info
    var yellowTeamView = new TeamView({
      collection: this.model.get('teamYellow'),
      className: 'team-info-y',
    });
    yellowTeamView.teamColor = 'Team Yellow';
    yellowTeamView.render();
    var blueTeamView = new TeamView({
      collection: this.model.get('teamBlue'),
      className: 'team-info-b'
    });
    blueTeamView.teamColor = 'Team Blue';
    blueTeamView.render();

    //Add all board html
    $gameHtml.append(yellowTeamView.$el)
    $gameHtml.append(blueTeamView.$el)
    var boardView = new BoardView({collection: this.model.get('board')});
    $gameHtml.append(boardView.$el);
  },
  updateTurn: function(turn) {
    this.model.updateTurn(turn); 
    return this.model.fetch({
      success: this.render.bind(this),
      error: function(collection, response, options){
        console.log('error', response);
      }
    });
  },
  initializeSlider: function() {

  },
  restartGame: function() {
    this.paused = false;
    this.togglePlayGame();
    this.updateTurn(0);
  },
  togglePlayGame: function() {
    this.paused = !this.paused;
    var $playPause = this.$el.find('.play-pause-game');
    if (this.paused) {
      //Change pause button to a play button
      $playPause.removeClass('glyphicon-pause');
      $playPause.addClass('glyphicon-play');
    } else {
      //Change play button to a pause button
      $playPause.removeClass('glyphicon-play');
      $playPause.addClass('glyphicon-pause');

      //Start auto-playing the game
      this.autoPlayGame();
    }
  },
  autoPlayGame: function() {
    //Store the current turn and the turn at which
    //the game will end
    var currTurn = this.model.get('turn');
    var maxTurn = this.model.get('maxTurn');

    //If the game is not yet over, go to next turn
    if (currTurn < maxTurn && this.paused === false && this.playInProgress === false) {
      //Keeps track of whether we are waiting for the promise
      //to resolve (used to prevent issues with users doubleclicking)
      //the play button
      this.playInProgress = true;
      var updateTurnPromise = this.updateTurn(currTurn+1);
      var gameView = this;
      $.when(updateTurnPromise).then(function() {
        //promise has resolved, no longer waiting
        this.playInProgress = false;

        //Runs this again (will run until no turns are left or
        //until paused)
        this.autoPlayGame();
      }.bind(this));
    }  
  }
});
