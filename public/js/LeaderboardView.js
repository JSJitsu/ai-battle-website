var LeaderboardView = Backbone.View.extend({
  tagName: 'div',
  initialize: function() {
    this.viewing = {
      stat: 'kills',
      type: 'lifetime'
    };

    var initialHtml = '<div class="dropdown"><ul class="dropdown-menu" role="menu" aria-labelledby="dLabel"><li><a tabindex="-1" href="#">Kills</a></li></ul></div>';

    this.$el.html = initialHtml;

    //Tells the model to get data
    //for the specified stat and type
    this.model.updateViewingParams(this.viewing);

    // jQuery promise
    $.when(this.model.fetch()).then(function() {
      this.render();
    }.bind(this));
  },

  events: {
    'change .leaderboardDropdown': 'updateViewingParams'
    // 'click .recentLeaders': 'showRecent',
    // 'click .lifetimeLeaders': 'showLifetime'
  },
  updateViewingParams: function() {
    this.viewing.stat = this.$el.find('.leaderboardDropdown').value();
    this.model.updateViewingParams(this.viewing);

    $.when(this.model.fetch()).then(function() {
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
    //Add dropdown value also
    var tableHtml = '<table class="leaderboard table">';
    var topUsers = this.model.get('topUsers');
    for (var i=0; i<topUsers.length; i++) {
      var user = topUsers[i];
      tableHtml += '<tr>';

      //Add the rank of the user to table
      tableHtml += '<td>' + i + '</td>';
      tableHtml += '<td>' + user.name + '</td>';
      tableHtml += '<td>' + user.value + '</td>';


      tableHtml += '</tr>';
    }
    tableHtml += '</table>'
    this.$el.append(tableHtml);
    // this.$el.find();
    // var dropdownValue = $('#dropdownMenu').text();
    // console.log(dropdownValue);
    // if (!dropdownValue) {
    //   html = new EJS({url: '/ejs_templates/lifetimeLeaders'}).render(this.model.get('lifetimeKills'));
    // }
    // if (this.viewing === "lifetime" && dropdownValue === 'Kills') {
    //   html = new EJS({url: '/ejs_templates/lifetimeLeaders'}).render(this.model.get('lifetimeKills'));
    // } else if (this.viewing === 'recent' && dropdownValue === 'Kills') {
    //   html = new EJS({url: '/ejs_templates/recentLeaders'}).render(this.model.get('recentKills'));
    // }
  }

});