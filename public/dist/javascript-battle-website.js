var Board = Backbone.Collection.extend({
  model: BoardTile
});;var BoardTile = Backbone.Model.extend({
});;var BoardTileView = Backbone.View.extend({
  tagName: 'div',
  className: 'battle-tile',
  initialize: function() {
    if (this.model === undefined) {
      console.log(undefined);
    }
    this.render();
    this.model.on('change', this.render());
  },
  render: function() {
    var subType = this.model.get('subType');
    var type = this.model.get('type');
    var teamId = this.model.get('team');
    if (subType !== 'Unoccupied') {
      var assets = {
        Tree: '../img/tree.png',
        Adventurer: '../img/bkknight.png',
        BlackKnight: '../img/black-knight.png',
        DiamondMine: '../img/diamond.png',
        HealthWell: '../img/pot.png',
        Bones: '../img/grave.png'
      };
      var html = '<img src="' + assets[subType] + '" class="sprite">';
        var colors = {
          0: "team-yellow",
          1: "team-blue"
        };
      if (type === 'Hero') {
        var name = this.model.get('name');
        var heroId = this.model.get('battleId');
        var HP = this.model.get('health');
        var gameTurn = this.model.get('gameTurn');
        var lastActiveTurn = this.model.get('lastActiveTurn');
        if(lastActiveTurn === (gameTurn - 1) && gameTurn !== 1){
          this.$('.sprite').addClass('current-turn');
        }
        html = '<img src="' + assets[subType] + '" id="H' + heroId +'" class="sprite">';
        
        html += '<span class="indicator ' + colors[this.model.get('team')] +'">' + heroId + '</span>';
        html += '<span class="lifebar"><span class="life-capacity" style="height:' + HP + '%"></span></span>';
        this.$el.addClass('current-user-' + name);
      } else if (type === 'DiamondMine') {
        var owner = this.model.get('owner');
        if (owner) {
          html += '<span class="indicator ' + colors[owner.team] +'">' + owner.id + '</span>';
        } 
      }
      this.$el.html(html);
    }
  }
});;var BoardView = Backbone.View.extend({
  tagName: 'section',
  className: 'battle-map',
  initialize: function() {
    this.render()
  },
  render: function() {
    this.$el.html('');
    this.createBoardView();
  },
  createBoardView: function() {
  	var boardLength = this.collection.lengthOfSide;
    for(var i = 0; i < boardLength; i++){
      var $tr = $('<div class="tile-row">');
    	for(var j = 0; j < boardLength; j++){
        var tileView = new BoardTileView({
    			model: this.collection.at(i * boardLength + j)          
    		});
    	  $tr.append(tileView.$el);
    	}
    	this.$el.append($tr);
    }
  }
});
;
var Game = Backbone.Model.extend({
  url: 'api/gameDataForUser/1',

  initialize: function() {
    var userModel = new User();
    this.set('userModel', userModel);
  },
  
  parse: function(response) {
    this.set('turn', response.turn);
    this.set('maxTurn', response.maxTurn);
    this.set('moveMessages', response.moveMessage);
    this.set('winningTeam', response.winningTeam);
    this.set('attackMessages', response.attackMessage);
    this.set('killMessages', response.killMessage);
    this.set('teamDiamonds', response.totalTeamDiamonds);
    var board = new Board();
    var teamYellow = new Team();
    var teamBlue = new Team();

    board.lengthOfSide = response.board.lengthOfSide;
    //add team yellow hero Models to team collection
    _.each(response.teams[0], function(heroObject){
      heroObject.gameTurn = response.turn;
      heroObject.battleId = heroObject.id;
      delete heroObject.id;

      var hero = new Hero(heroObject);
      teamYellow.add(hero);
    });
    //add team blue hero Models to team collection
    _.each(response.teams[1], function(heroObject){
      heroObject.gameTurn = response.turn;
      heroObject.battleId = heroObject.id;
      delete heroObject.id;

      var hero = new Hero(heroObject);
      teamBlue.add(hero);
    });

    

    _.each(_.flatten(response.board.tiles), function(tileObject, key, list) {
      //The id from our game model was overwriting 
      tileObject.battleId = tileObject.id;
      delete tileObject.id;
      tileObject.gameTurn = this.get('turn');
      var tile = new BoardTile(tileObject);
      board.add(tile);

    }.bind(this));

    this.set('teamYellow', teamYellow);
    this.set('teamBlue', teamBlue);
    this.set('board', board);
  },
  updateTurn: function(turn) {
    this.url = '/api/gameDataForUser/' + turn;
  }
});;var GameView = Backbone.View.extend({
  tagName: 'div',
  className: 'outer',
  initialize: function(){
    this.updateTurn(0);
    this.paused = true;
    this.playInProgress = false;
    this.sliderInitialized = false;
    this.$el.html('<div class="messages"></div>' + '<div class="row map"></div>');
    this.$el.append('<input class="row slider" />' +
                    '</div>');
    this.$el.append('<div class="row play-controls">' +
                      '<span class="play-pause-game glyphicon glyphicon-play">' +
                      '</span>' +
                      '<span class="restart-game glyphicon glyphicon-repeat">' +
                      '</span>' +
                    '</div>');
    this.$el.append('<span class="turn"></span>');
  },
  events: {
    'click .play-pause-game': 'togglePlayGame',
    'click .restart-game': 'restartGame'
  },
  render: function(){
    this.checkWinner();
    var $gameHtml = this.$el.find('.map');
    $gameHtml.html('');
    //Show game update messages
    $('.messages').text('');
    $('.messages').append(this.model.get('killMessages'));
       //Add html for team info
    var yellowTeamView = new TeamView({
      collection: this.model.get('teamYellow'),
      className: 'team-info t-yellow',
    });
    yellowTeamView.teamColor = 'Team Yellow';
    yellowTeamView.diamonds = this.model.get('teamDiamonds')[0];
    yellowTeamView.render();
    var blueTeamView = new TeamView({
      collection: this.model.get('teamBlue'),
      className: 'team-info t-blue'
    });
    blueTeamView.teamColor = 'Team Blue';
    blueTeamView.diamonds = this.model.get('teamDiamonds')[1];
    blueTeamView.render();

    var boardView = new BoardView({collection: this.model.get('board')});
    //Add all board html
    $gameHtml.append(yellowTeamView.$el);
    $gameHtml.append(boardView.$el);
    $gameHtml.append(blueTeamView.$el);
    this.$el.find('.turn').text('Turn: ' + this.model.get('turn'));
  },
  updateTurn: function(turn) {
    function isLoading () {
      if (!$('.battle-tile').length && !$('.leaderboard-table').children().length) {
        $('.gamegrid-content, .game-tips').hide();
        if (!$('.spinner').length) {
          // ('#replay').css('min-height', '500px');
          $('#replay').append('<img class="spinner" src="https://s3.amazonaws.com/jharclerode/350+(2).GIF">');
        }
        setTimeout(isLoading,500);
      }
      else {
        $('.spinner').hide();
        setTimeout(function () {
          // $('#replay').css('min-height', '1094px');
          $('.gamegrid-content, .game-tips').show();
        }, 500);
        return;
      }
    }
    setTimeout(isLoading,950);
    this.model.updateTurn(turn); 
    return this.model.fetch({
      success: function() {
        this.initializeSlider();
        var userModel = this.model.get('userModel');
        userModel.fetch({
          success: function() {
            this.render();
            var currentUserHandle = userModel.get('githubHandle');
            if (currentUserHandle) {
              this.$el.find('.current-user-' + currentUserHandle).append('<span class="arrow"></span>');
            }
          }.bind(this),
          error: function(collection, response, options){
            this.initializeSlider();
            this.render();
          }.bind(this)    
        });
      }.bind(this),
      error: function(collection, response, options){
      }.bind(this)
    });
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
    var $slider = this.$el.find('.slider');
    var slider = $slider[0];

    //Get basic info about game state
    var currentTurn = this.model.get('turn');
    var maxTurn = this.model.get('maxTurn');

    //Initialize new slider and set it to update
    //the turn on slide
    var init = new Powerange(slider, {
      min: 0,
      max: maxTurn,
      step: 1,
      callback: function() {
        //Pause the game
        this.pauseGame();

        //Slider value will range from the min to max
        this.updateTurn(slider.value);

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

        //Updates the slider location to track with the current turn
        this.sendSliderToTurn(currTurn + 1);

        //Runs this again (will run until no turns are left or
        //until paused)
        this.autoPlayGame();
      }.bind(this));
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
;var Leaderboard = Backbone.Model.extend({
  
  // give model url attribute for server to handle
  url: 'api/leaderboard/lifetime/kills',
  updateLeaderboard: function(params) {
    this.url = 'api/leaderboard/' + params.timeFrame + '/' + params.stat;
  }

});;var LeaderboardView = Backbone.View.extend({
  tagName: 'div',
  className: 'centered',
  initialize: function() {
    
    //Current leaderboard settings
    this.leaderboardParams = {
      stat: 'damageDealt',
      timeFrame: 'lifetime'
    };

    //Dropdown items for lifetime stats
    this.statItems = {
      'lifetime': [
        ['damageDealt', 'Damage Dealt'],
        ['deaths', 'Deaths'],
        ['diamondsEarned', 'Diamonds Earned'],
        ['gravesRobbed', 'Graves Robbed'],
        ['healthGiven', 'Health Given'],
        ['healthRecovered', 'Health Recovered'],
        ['kills', 'Kills'],
        ['losses', 'Losses'],
        ['minesCaptured', 'Mines Captured'],
        ['wins', 'Wins']
      ],
      'average': [
        ['damageDealt', 'Damage Dealt'],
        ['deaths', 'Deaths'],
        ['diamondsEarned', 'Diamonds Earned'],
        ['gravesRobbed', 'Graves Robbed'],
        ['healthGiven', 'Health Given'],
        ['healthRecovered', 'Health Recovered'],
        ['kills', 'Kills'],
        ['losses', 'Losses'],
        ['minesCaptured', 'Mines Captured'],
        ['wins', 'Wins']
      ],
      'recent': [
        ['damageDealt', 'Damage Dealt'],
        ['diamondsEarned', 'Diamonds Earned'],
        ['gravesRobbed', 'Graves Robbed'],
        ['healthGiven', 'Health Given'],
        ['healthRecovered', 'Health Recovered'],
        ['kills', 'Kills'],
        ['minesCaptured', 'Mines Captured'],
      ]
    };

    var timeFrames = [
      ['lifetime', 'Overall'],
      ['average', 'Average'],
      ['recent', 'Most Recent Battle']
    ];

    var timeHtml = timeFrames.map(function(timeFrame) {
      return '<option class="leaderboard" value="' + timeFrame[0] + '">' + timeFrame[1] + '</option>';
      console.log(timeFrame);
    });

    var statsHtml = this.statItems[this.leaderboardParams.timeFrame].map(function(stat) {
      return '<option value="' + stat[0] + '">' + stat[1] + '</option>';
    });

    var initialHtml =
        '<select class="leaderboard-time-param" name="stats">' + timeHtml.join('') + '</select>' +
        '<select class="leaderboard-stat-param" name="time">' + statsHtml.join('') + '</select>' +
        '<table class="table table-striped table-bordered table-responsive leaderboard-table">' + 
        '</table>';


    this.$el.html(initialHtml);

    //Tells the model to get data
    //for the specified stat and type
    this.model.updateLeaderboard(this.leaderboardParams);

    // Update the leaderboard model, then render on completion
    $.when(this.model.fetch()).then(function() {
      this.render();
    }.bind(this));
  },

  events: {
    'change select.leaderboard-time-param': 'updateLeaderboardTime',
    'change select.leaderboard-stat-param': 'updateLeaderboardStat'
  },
  updateLeaderboardTime: function(clickEvent) {
    //Update dropdown for the time frame selected
    if (this.leaderboardParams.timeFrame !== clickEvent.currentTarget.value) {

      //Get the stat the user clicked on
      this.leaderboardParams.timeFrame = clickEvent.currentTarget.value;

      //Update the dropdown stats list for the new time frame
      var statItemsForTimeFrame = this.statItems[this.leaderboardParams.timeFrame]
      var statsHtml = statItemsForTimeFrame.map(function(stat) {
        return '<option value="' + stat[0] + '">' + stat[1] + '</option>';
      });
      var $statSelect = this.$el.find('select.leaderboard-stat-param');
      $statSelect.html(statsHtml);

      //If last selected stat is in the new stat list, keep it
      var inList = false;
      for (var i=0; i<statItemsForTimeFrame.length; i++) {
        if (statItemsForTimeFrame[i][0] === this.leaderboardParams.stat) {
          $statSelect.val(this.leaderboardParams.stat);
          inList = true;
          break;
        }
      }
      
      //If last selected stat is not valid for this time frame,
      //default to the first stat
      if (!inList) {
        this.leaderboardParams.stat = statItemsForTimeFrame[0][0];
      }

      //Update the leaderboard itself
      this.updateLeaderboard();
    }
  },
  updateLeaderboardStat: function(clickEvent) {

    //Get the stat the user clicked on
    this.leaderboardParams.stat = clickEvent.currentTarget.value;

    //Update the leaderboard to show the new stat
    this.updateLeaderboard();
  },
  updateLeaderboard: function() {
    //Update the leaderboard model to grab the new leaderboard data
    this.model.updateLeaderboard(this.leaderboardParams);

    //Grab the new leaderboard data, then re-render
    $.when(this.model.fetch()).then(function() {
      this.render();
    }.bind(this), function() {
      console.log('Failed to retrieve leaderboard');
      this.render(true);
    }.bind(this));
  },

  render: function(failed) {

    //Update Leaderboard
    var $table = this.$el.find('table.leaderboard-table');
    
    if (failed) {

      $table.html('<tr><th>Rank</th><th>Name</th><th>Failed To Load</th></tr>')

    } else {
      var headerItem = 'Failed To Load';

      //Replace with object-based logic eventually
      //Gets the nicely formatted label to display in the table header
      var statItems = this.statItems[this.leaderboardParams.timeFrame];

      for (var i=0; i<statItems.length; i++) {
        var value = statItems[i][0];
        if (value === this.leaderboardParams.stat) {
          headerItem = statItems[i][1];
          break;
        }
      }

      var tableHtml =
        '<tr class="lifetime-table-header leaderboard-headers">' +
          '<th class="leaderboard-rank">Rank</th>' +
          '<th class="leaderboard-name">Name</th>' +
          '<th class="leaderboard-damage">' + headerItem + '</th>' +
        '</tr>';

      var topUsers = this.model.get('topUsers');
      for (var i=0; i<topUsers.length; i++) {
        var user = topUsers[i];
        tableHtml += '<tr>';

        //Add the rank of the user to table
        tableHtml += '<td>' + (i + 1) + '</td>';
        tableHtml += '<td><a href="https://github.com/' + encodeURIComponent(user.name) + '/hero-starter">' + user.name + '</a></td>';
        tableHtml += '<td>' + user.value + '</td>';


        tableHtml += '</tr>';
      }
      tableHtml += '</table>';
      $table.html(tableHtml);
    }
  }

});;var NavbarView = Backbone.View.extend({

  initialize: function(){
    this.render();
    $.when(this.model.fetch()).then(function() {
      this.render();
    }.bind(this));
  },

  render: function(){
    var html;
    var githubHandle = this.model.get('githubHandle');

    // if logged in
    if(githubHandle) {
      html = new EJS({url: '../ejs_templates/navbar'}).render(this.model);
    } else {
      html = new EJS({url: '../ejs_templates/navbarNotLoggedIn'}).render(this.model);
    }
    
    this.$el.html(html);
  }
});;var RulesView = Backbone.View.extend({
  
  initialize: function(){
    this.viewing = {};
    this.viewing = "general";
    this.render();
  },

  events: {
    'click .general': 'showGeneral',
    'click .rules': 'showRules',
    'click .improve': 'showImprove'
  },

  showRules: function(event) {
    event.preventDefault();
    this.viewing = "rules";
    this.render();
    $('.rules').tab('show');
  },
  
   showGeneral: function(event) {
    event.preventDefault();
    this.viewing = "general";
    this.render();
    $('.general').tab('show');
  },

   showImprove: function(event) {
    event.preventDefault();
    this.viewing = "improve";
    this.render();
    $('.improve').tab('show');
  },

  render: function(){
    var html;
    if(this.viewing === "rules") {
      html = new EJS({url: '/ejs_templates/rules'}).render(this.model);
    } else if (this.viewing === "general") {
      html = new EJS({url: '/ejs_templates/general'}).render(this.model);
    }  else if (this.viewing === "improve") {
      html = new EJS({url: '/ejs_templates/improve'}).render(this.model);
    }
    this.$el.html(html);
  }


});;/**
 * cbpAnimatedHeader.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
var cbpAnimatedHeader = (function() {

	var docElem = document.documentElement;
	var header = document.querySelector( '.navbar-fixed-top' );
	var didScroll = false;
	var changeHeaderOn = 300;

	function init() {
		window.addEventListener( 'scroll', function( event ) {
			if( !didScroll ) {
				didScroll = true;
				setTimeout( scrollPage, 250 );
			}
		}, false );
	}

	function scrollPage() {
	  var options = document.querySelector('.user-options');
		var sy = scrollY();
		if ( sy >= changeHeaderOn ) {
			classie.add( header, 'navbar-shrink' );
			if(options){
        classie.add( options, 'user-options-shrink');
			}
		}
		else {
			classie.remove( header, 'navbar-shrink' );
			if(options){
        classie.remove( options, 'user-options-shrink');
			}
		}
		didScroll = false;
	}

	function scrollY() {
		return window.pageYOffset || docElem.scrollTop;
	}

	init();

})();
;/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );
;/*!
 * Start Bootstrap - Freelancer Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('.page-scroll a').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Floating label headings for the contact form
$(function() {
    $("body").on("input propertychange", ".floating-label-form-group", function(e) {
        $(this).toggleClass("floating-label-form-group-with-value", !! $(e.target).val());
    }).on("focus", ".floating-label-form-group", function() {
        $(this).addClass("floating-label-form-group-with-focus");
    }).on("blur", ".floating-label-form-group", function() {
        $(this).removeClass("floating-label-form-group-with-focus");
    });
    $('.hide-tip').click(function(){
      $('.game-tips').fadeOut('slow');
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

;var Hero = Backbone.Model.extend({
});;var HeroView = Backbone.View.extend({
  className: 'list-group-item list-group-item-info score-info',
  tagName: 'li',
  initialize: function() {
    this.render();
  },
  render: function() {
    var heroId = this.model.get('battleId');
    var health = this.model.get('health');
    var name = this.model.get('name');
    var turn = this.model.get('gameTurn');
    var currentTurn = this.model.get('lastActiveTurn');

    if(health < 1){
      this.$el.removeClass('list-group-item-info').addClass('list-group-item-danger');
      health = 'Dead';
    } else{
      health =  health + 'HP';
    }
    var heroName = '<div class="hero-header h-i' + heroId + '">(id:' + heroId + ') ' + 
        '<span>' + name + '</span>' + ' </div>'
    var health = '<div class="health-info h-i' + heroId + '">' + health + '</div>';
    this.$el.append(heroName + health);
  }
});;var Team = Backbone.Collection.extend({
  model: Hero
});;var TeamView = Backbone.View.extend({
  className: 'list-group',
  tagName: 'div',
  teamColor: undefined,
  initialize: function(){
    // this.render();
  },
  render: function() {
    this.$el.html('');
    if(this.teamColor){
      this.$el.append('<h5 class="team-name">' + this.teamColor + ' diamonds: ' + this.diamonds + '</h5>');
    }
    this.createTeamView();
  },
  createTeamView: function() {
    _.each(this.collection.models, function(hero){
      var heroView = new HeroView({
        model: hero
      });
      this.$el.append(heroView.$el);
    }.bind(this));
  }
});;var User = Backbone.Model.extend({
  
  // give model url attribute for server to handle
  url: '/userInfo',

  // set id attribute so that we can do put requests
  // backbone looks for 'id' otherwise
  idAttribute: '_id',

  average: function() {
    var gamesPlayed = this.get('lifetimeStats').wins + this.get('lifetimeStats').losses;
    var that = this;

    var numbersForDisplay = function(prop) {
      return (Number(parseFloat(that.get('lifetimeStats')[prop] / gamesPlayed).toFixed(2)) || 0) + ' per game';
    };

    var aveStats = {
      gamesPlayed: gamesPlayed,
      kills: numbersForDisplay('kills'),
      deaths: numbersForDisplay('deaths'),
      damageDealt: numbersForDisplay('damageDealt'),
      minesCaptured: numbersForDisplay('minesCaptured'),
      diamondsEarned: numbersForDisplay('diamondsEarned'),
      healthRecovered: numbersForDisplay('healthRecovered'),
      gravesRobbed: numbersForDisplay('gravesRobbed')
    }; 
    return aveStats;
  }

});;var UserView = Backbone.View.extend({
  
  initialize: function() {
    $(function () {
      $('.page-scroll a').bind('click', function(event) {
          var $anchor = $(this);
          $('html, body').stop().animate({
              scrollTop: $($anchor.attr('href')).offset().top
          }, 1500, 'easeInOutExpo');
          event.preventDefault();
      });
    });
    this.viewing = {};
    this.viewing = "settings";
    this.render();
    // fetch will get object at model's url
    // can use 'parse' as middleware for object
    // jQuery promise
    $.when(this.model.fetch()).then(function() {
      this.render();
    }.bind(this));
  },

  events: {
    'submit': 'handleSubmit',
    'click .settings': 'showSettings',
    'click .recentStats': 'showRecent',
    'click .lifetimeStats': 'showLifetime',
    'click .averageStats': 'showAverage'
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var val = this.$el.find('#inputRepo').val();
    var codeRepo = this.model.get('codeRepo');
    // do not process if an empty string or equal to current code repo
    if (val.length !== 0 && val !== codeRepo) {
      // update the model with the new form data
      // escape the form input for security
      this.model.set('codeRepo', _.escape(val));
      //Save the model
      this.model.save();
      this.render();
      // display form as updated with check mark and green highlight
      this.$el.find(".form-group").addClass("has-success");
      this.$el.find(".form-group").addClass("has-feedback");
    } else {
      // if empty string or equal to current code repo do not display as updated
      this.$el.find(".form-group").removeClass("has-success");
      this.$el.find(".form-group").removeClass("has-feedback");
      // render to get current code repo value displayed rather than empty string
      this.render();
    }
  },

  showSettings: function(event) {
    event.preventDefault();
    this.viewing = "settings";
    this.render();
    this.$el.find('.settings').tab('show');
  },
  
   showRecent: function(event) {
    event.preventDefault();
    this.viewing = "recent";
    this.render();
    this.$el.find('.recentStats').tab('show');
  },

   showLifetime: function(event) {
    event.preventDefault();
    this.viewing = "lifetime";
    this.render();
    this.$el.find('.lifetimeStats').tab('show');
  },

   showAverage: function(event) {
    event.preventDefault();
    this.viewing = "average";
    this.render();
    this.$el.find('.averageStats').tab('show');
  },

  render: function() {
    var githubHandle = this.model.get('githubHandle');
    var html;
    if (githubHandle && this.viewing === "settings") {
      html = new EJS({url: '/ejs_templates/settings'}).render(this.model);
    } else if (githubHandle && this.viewing === 'lifetime') {
      html = new EJS({url: '/ejs_templates/lifetime'}).render(this.model);
    } else if (githubHandle && this.viewing === 'recent') {
      html = new EJS({url: '/ejs_templates/recent'}).render(this.model);
    } else if (githubHandle && this.viewing === 'average') {
      var averageStats = this.model.average();
      averageStats['githubHandle'] = this.model.get('githubHandle');
      html = new EJS({url: '/ejs_templates/average'}).render(averageStats);
    } else if (!githubHandle) {
      html = new EJS({url: '/ejs_templates/notLoggedIn'}).render(this.model);
    }
    this.$el.html(html);
  }

});;var app = {};

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
$('#leaderboard div.container').append(app.leaderboardView.$el);
