var LeaderboardView = Backbone.View.extend({
  tagName: 'div',
  initialize: function() {
    this.viewing = {
      stat: 'Kills',
      type: 'Lifetime'
    };

    var initialHtml = '<div class="row centered"><div class="dropdown">' + 
         '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown">' + 
           'LeaderBoard Stats' + 
           '<span class="caret"></span>' + 
          '</button>' + 
          '<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">' +
            '<li role="presentation"><a role="menuitem" href="#">Kills</a></li>' +
          '</ul>' +
        '</div>' + 
      '</div>';

    this.$el.append(initialHtml);

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
    var tableHtml = '<div class="container">' +
  '<div class="row">' + 
    // '<ul class="nav nav-tabs leaderViewTabs" role="tablist">' +
    //   '<li><a href="#">Recent Leaders</a></li>' +
    //   '<li><a href="#">Lifetime Leaders</a></li>' +
    // '</ul>' +
  '</div>' +
    '<table class="table table-bordered table-responsive table-striped lifetime-table leaderboard-table">' +
      '<tr class="lifetime-table-header">' +
        '<td>Rank</td>' +
        '<td>Name</td>' +
        '<td>' + this.viewing.stat + '</td>' +
      '</tr>';
    var topUsers = this.model.get('topUsers');
    for (var i=0; i<topUsers.length; i++) {
      var user = topUsers[i];
      tableHtml += '<tr>';

      //Add the rank of the user to table
      tableHtml += '<td>' + (i + 1) + '</td>';
      tableHtml += '<td>' + user.name + '</td>';
      tableHtml += '<td>' + user.value + '</td>';


      tableHtml += '</tr>';
    }
    tableHtml += '</table></div></div></div>';
    this.$el.append(tableHtml);
  }

});