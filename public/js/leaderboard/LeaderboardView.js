var LeaderboardView = Backbone.View.extend({
  tagName: 'div',
  className: 'centered',
  events: {
    'change select.leaderboard-time-param': 'updateLeaderboardTime',
    'change select.leaderboard-stat-param': 'updateLeaderboardStat'
  },
  initialize: function() {
    var me = this;

    //Current leaderboard settings
    me.leaderboardParams = {
      stat: 'games_won',
      timeFrame: 'lifetime'
    };

    // Used to render sorting options and table columns
    me.displayStats = [
      {
        header: 'Wins',
        mapping: 'games_won'
      },
      {
        header: 'Kills',
        mapping: 'kills'
      },
      {
        header: 'Skulls',
        mapping: 'graves_taken'
      },
      {
        header: 'Diamonds',
        mapping: 'diamonds_earned'
      },
      {
        header: 'Healer',
        mapping: 'health_given'
      }
    ];

    var statsHtml = me.displayStats.map(function(displayStat) {
      return '<option value="' + displayStat.mapping + '">' + displayStat.header + '</option>';
    });

    var initialHtml =
        'Sort by: ' +
        '<select class="leaderboard-stat-param" name="time">' + statsHtml.join('') + '</select><br><br>' +
        '<table class="table table-striped table-bordered table-responsive leaderboard-table">' + 
        '</table>';


    me.$el.html(initialHtml);

    //Tells the model to get data
    //for the specified stat and type
    me.model.updateLeaderboard(me.leaderboardParams);

    // Update the leaderboard model, then render on completion
    $.when(me.model.fetch()).then(function() {
      me.render();
    }).fail(function () {
      me.render(true);
    });
  },
  updateLeaderboardTime: function(clickEvent) {
    //Update dropdown for the time frame selected
    if (this.leaderboardParams.timeFrame !== clickEvent.currentTarget.value) {

      //Get the stat the user clicked on
      this.leaderboardParams.timeFrame = clickEvent.currentTarget.value;

      //Update the dropdown stats list for the new time frame
      var statItemsForTimeFrame = this.statItems[this.leaderboardParams.timeFrame];
      var statsHtml = statItemsForTimeFrame.map(function(stat) {
        return '<option value="' + stat[0] + '">' + stat[1] + '</option>';
      });
      var $statSelect = this.$el.find('select.leaderboard-stat-param');
      $statSelect.html(statsHtml);

      //If last selected stat is in the new stat list, keep it
      var inList = false;
      statItemsForTimeFrame.forEach( function (statItem) {
        if (statItem[0] === this.leaderboardParams.stat) {
          $statSelect.val(this.leaderboardParams.stat);
          inList = true;
          return;
        }
      }.bind(this));
      
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
      this.render(true);
    }.bind(this));
  },

  render: function(failed) {

    //Update Leaderboard
    var $table = this.$el.find('table.leaderboard-table');
    
    if (failed) {
      $table.html('<tr><th>We couldn\'t find the information you\'re looking for.</th></tr>');
    } else {
      var displayStats = this.displayStats;

      var tableHtml =
        '<tr class="lifetime-table-header leaderboard-headers">' +
          '<th class="leaderboard-rank">Rank</th>' +
          '<th class="leaderboard-name">Name</th>' +
          displayStats.reduce(function (html, displayStat) {
            return html + '<th class="leaderboard-damage">' + displayStat.header + '</th>';
          }, displayStats[0]) +
        '</tr>';

      var stats = this.model.get('stats');
      stats.forEach( function (user, idx) {
        tableHtml += '<tr>';

        //Add the rank of the user to table
        tableHtml += '<td>' + (idx + 1) + '</td>';
        tableHtml += '<td><a href="https://github.com/' + encodeURIComponent(user.github_login) + '/hero-starter">' + user.github_login + '</a></td>';
        tableHtml += displayStats.reduce(function (html, displayStat) {
          return html + '<td>' + user[displayStat.mapping] + '</td>';
        }, displayStats[0]);


        tableHtml += '</tr>';
      });
      tableHtml += '</table>';
      $table.html(tableHtml);
    }
  }

});