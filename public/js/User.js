var User = Backbone.Model.extend({
  
  // give model url attribute for server to handle
  url: '/userInfo',

  // set id attribute so that we can do put requests
  // backbone looks for 'id' otherwise
  idAttribute: '_id',

  average: function() {
    var gamesPlayed = this.get('lifetimeStats').wins + this.get('lifetimeStats').losses;

    var aveStats = {
      gamesPlayed: gamesPlayed,
      kills: (this.get('lifetimeStats').kills / gamesPlayed) || this.get('lifetimeStats').kills,
      deaths: (this.get('lifetimeStats').deaths / gamesPlayed) || this.get('lifetimeStats').deaths,
      damageDealt: (this.get('lifetimeStats').damageDealt / gamesPlayed) || this.get('lifetimeStats').damageDealt,
      minesCaptured: (this.get('lifetimeStats').minesCaptured / gamesPlayed) || this.get('lifetimeStats').minesCaptured,
      diamondsEarned: (this.get('lifetimeStats').diamondsEarned / gamesPlayed) || this.get('lifetimeStats').diamondsEarned,
      healthRecovered: (this.get('lifetimeStats').healthRecovered / gamesPlayed) || this.get('lifetimeStats').healthRecovered,
      gravesRobbed: (this.get('lifetimeStats').gravesRobbed / gamesPlayed) || this.get('lifetimeStats').gravesRobbed
    }; 
    return aveStats;
  }

});