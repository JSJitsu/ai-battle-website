var LeaderboardView = Backbone.View.extend({
  tagName: 'div',
  initialize: function() {
    
    this.leaderboardParams = {
      stat: 'kills',
      timeFrame: 'lifetime'
    };

    //Create dropdown html
    this.statItems = [
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
    ];

    var statsHtml = this.statItems.map(function(stat) {
      return '<option class="leaderboard" value="' + stat[0] + '">' + stat[1] + '</option>';
    });

    var timeFrames = [
      ['lifetime', 'Overall'],
      ['recent', 'Most Recent Battle']
    ]

    var timeHtml = timeFrames.map(function(timeFrame) {
      return '<option class="leaderboard" value="' + timeFrame[0] + '">' + timeFrame[1] + '</option>';
    });

    var initialHtml =
        '<select class="col-lg-2 col-lg-offset-4 leaderboard-time-param" name="stats">' + timeHtml.join('') + '</select>' +
        '<select class="col-lg-2 leaderboard-stat-param" name="time">' + statsHtml.join('') + '</select>' +
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

    //Get the stat the user clicked on
    this.leaderboardParams.timeFrame = clickEvent.currentTarget.value;

    //Update the leaderboard to show the new stat
    this.updateLeaderboard();
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
      var displayItem = 'Failed To Load';

      //Replace with object-based logic eventually
      //Gets the nicely formatted label to display in the table header
      for (var i=0; i<this.statItems.length; i++) {
        var value = this.statItems[i][0];
        if (value === this.leaderboardParams.stat) {
          displayItem = this.statItems[i][1];
          break;
        }
      }

      var tableHtml =
        '<tr class="lifetime-table-header">' +
          '<th>Rank</th>' +
          '<th>Name</th>' +
          '<th>' + displayItem + '</th>' +
        '</tr>';

      var topTen = this.model.get('topTen');
      for (var i=0; i<topTen.length; i++) {
        var user = topTen[i];
        tableHtml += '<tr>';

        //Add the rank of the user to table
        tableHtml += '<td>' + (i + 1) + '</td>';
        tableHtml += '<td>' + user.name + '</td>';
        tableHtml += '<td>' + user.value + '</td>';


        tableHtml += '</tr>';
      }
      tableHtml += '</table>';
      $table.html(tableHtml);
    }
  }

});