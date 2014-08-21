var LeaderboardView = Backbone.View.extend({
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
      ['recent', 'Most Recent Battle']
    ];

    var timeHtml = timeFrames.map(function(timeFrame) {
      return '<option class="leaderboard" value="' + timeFrame[0] + '">' + timeFrame[1] + '</option>';
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
        '<tr class="lifetime-table-header">' +
          '<th class="leaderboard-headers">Rank</th>' +
          '<th class="leaderboard-headers">Name</th>' +
          '<th class="leaderboard-headers">' + headerItem + '</th>' +
        '</tr>';

      var topUsers = this.model.get('topUsers');
      for (var i=0; i<topUsers.length; i++) {
        var user = topUsers[i];
        tableHtml += '<tr>';

        //Add the rank of the user to table
        tableHtml += '<td class="leaderboard-data">' + (i + 1) + '</td>';
        tableHtml += '<td class="leaderboard-data">' + user.name + '</td>';
        tableHtml += '<td class="leaderboard-data">' + user.value + '</td>';


        tableHtml += '</tr>';
      }
      tableHtml += '</table>';
      $table.html(tableHtml);
    }
  }

});