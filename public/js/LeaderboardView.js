var LeaderboardView = Backbone.View.extend({
  tagName: 'div',
  initialize: function() {
    
    this.viewing = {
      stat: 'kills',
      type: 'Lifetime',
      selectedItem: 'Kills'
    };

    var initialHtml =
        '<div class="dropdown row centered">' +
          '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown">' + 
            '<span class="selected-leaderboard-item">Kills</span>' +
            '<span class="caret"></span>' +
          '</button>' +
          '<ul class="dropdown-menu leaderboard-dropdown" role="menu" aria-labelledby="dropdownMenu1">' +
          '</ul>' +
        '</div>' +
        '<table class="table table-striped table-bordered table-responsive leaderboard-table">' + 
        '</table>';

    this.$el.html(initialHtml);

    //Tells the model to get data
    //for the specified stat and type
    this.model.updateViewingParams(this.viewing);

    // jQuery promise
    $.when(this.model.fetch()).then(function() {
      this.render();
    }.bind(this));
  },

  events: {
    'click .dropdown-item': 'updateViewingParams'
    // 'click .recentLeaders': 'showRecent',
    // 'click .lifetimeLeaders': 'showLifetime'
  },
  updateDropdownHtml: function() {
    var dropdownItemHtml = '';

    //The list of stats we want to display
    var dropdownItems = [
      'Kills',
      'Deaths',
      'Diamonds Earned',
      'Mines Captured',
      'Damage Dealt'
    ];


    //Make dropdown list html
    for (var i=0; i<dropdownItems.length; i++) {

      //Remove currently selected stat from dropdown, add all others
      if (this.viewing.selectedItem !== dropdownItems[i]) {
        dropdownItemHtml += '<li><a class="dropdown-item">' + dropdownItems[i] + '</a></li>'
      }
    }

    //Update the selected item (not needed, bootstrap does this apparently)
    this.$el.find('span.selected-leaderboard-item').html(this.viewing.selectedItem);

    //Update the dropdown list
    console.log(this.$el.find('ul.leaderboard-dropdown'));
    this.$el.find('ul.leaderboard-dropdown').html(dropdownItemHtml);

  },
  updateViewingParams: function(clickEvent) {

    this.viewing.selectedItem = clickEvent.currentTarget.textContent;

    //Get the stat the user clicked on
    this.viewing.stat = this.viewing.selectedItem.replace(/\s+/g, '');

    //Update the leaderboard to show the new stat
    this.model.updateViewingParams(this.viewing);

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
      
    //Update dropdown
    this.updateDropdownHtml();

    //Update Leaderboard
    var $table = this.$el.find('table.leaderboard-table');
    
    var tableHtml =
      '<tr class="lifetime-table-header">' +
        '<td>Rank</td>' +
        '<td>Name</td>' +
        '<td>' + this.viewing.selectedItem + '</td>' +
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
    tableHtml += '</table>';
    $table.html(tableHtml);



  }

});