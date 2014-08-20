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
      kills: (Number(parseFloat(this.get('lifetimeStats').kills / gamesPlayed).toFixed(2)) || this.get('lifetimeStats').kills) + ' per game',
      deaths: (Number(parseFloat(this.get('lifetimeStats').deaths / gamesPlayed).toFixed(2)) || this.get('lifetimeStats').deaths) + ' per game',
      damageDealt: (Number(parseFloat(this.get('lifetimeStats').damageDealt / gamesPlayed).toFixed(2)) || this.get('lifetimeStats').damageDealt) + ' per game',
      minesCaptured: (Number(parseFloat(this.get('lifetimeStats').minesCaptured / gamesPlayed).toFixed(2)) || this.get('lifetimeStats').minesCaptured) + ' per game',
      diamondsEarned: (Number(parseFloat(this.get('lifetimeStats').diamondsEarned / gamesPlayed).toFixed(2)) || this.get('lifetimeStats').diamondsEarned) + ' per game',
      healthRecovered: (Number(parseFloat(this.get('lifetimeStats').healthRecovered / gamesPlayed).toFixed(2)) || this.get('lifetimeStats').healthRecovered) + ' per game',
      gravesRobbed: (Number(parseFloat(this.get('lifetimeStats').gravesRobbed / gamesPlayed).toFixed(2)) || this.get('lifetimeStats').gravesRobbed) + ' per game'
    }; 
    return aveStats;
  }

});