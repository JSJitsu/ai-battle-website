var LeaderboardView = Backbone.View.extend({
  tagName: 'div',
  initialize: function() {
    
    this.leaderboardParams = {
      stat: 'kills',
      type: 'lifetime'
    };

    //Create dropdown html
    var stats = [
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

    var statsHtml = stats.map(function(stat) {
      return '<option class="leaderboard" value="' + stat[0] + '">' + stat[1] + '</option>';
    });

    var initialHtml =
        '<select class="leaderboard" name="stats">' + statsHtml.join('') + '</select>' +
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
    'change select.leaderboard': 'updateLeaderboard'
    // 'click .recentLeaders': 'showRecent',
    // 'click .lifetimeLeaders': 'showLifetime'
  },
  updateLeaderboard: function(clickEvent) {

    //Get the stat the user clicked on
    this.leaderboardParams.stat = clickEvent.currentTarget.value;

    //Update the leaderboard to show the new stat
    this.model.updateLeaderboard(this.leaderboardParams);

    $.when(this.model.fetch()).then(function() {
      this.render();
    }.bind(this), function() {
      console.log('Failed to retrieve leaderboard');
      this.render();
    }.bind(this));
  },
  // showRecent: function(event) {
  //   event.preventDefault();
  //   this.viewing = "recent";
  //   this.render();
  //   $('.recentLeaders').tab('show');
  // },

  // showLifetime: function(event) {
  //   event.preventDefault();
  //   this.viewing = "lifetime";
  //   this.render();
  //   $('.lifetimeLeaders').tab('show');
  // },

  render: function() {

    //Update Leaderboard
    var $table = this.$el.find('table.leaderboard-table');
    
    var tableHtml =
      '<tr class="lifetime-table-header">' +
        '<td>Rank</td>' +
        '<td>Name</td>' +
        '<td>' + this.leaderboardParams.stat + '</td>' +
      '</tr>';

    var topUsers = this.model.get('topTen');
    for (var i=0; i<topUsers.length; i++) {
      var user = topUsers[i];
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

});