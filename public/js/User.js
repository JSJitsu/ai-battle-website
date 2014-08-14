var User = Backbone.Model.extend({
  
  // give model url attribute for server to handle
  url: '/userInfo',

  // set id attribute so that we can do put requests
  // backbone looks for 'id' otherwise
  idAttribute: '_id',

  average: function() {
    var gamesPlayed = this.get('lifetimeStats').wins + this.get('lifetimeStats').losses;
    console.log('gamesPlayed: ', gamesPlayed);

    var aveStats = {
      gamesPlayed: gamesPlayed,
      kills: this.get('lifetimeStats').kills / gamesPlayed,
      deaths: this.get('lifetimeStats').deaths / gamesPlayed,
      damageDealt: this.get('lifetimeStats').damageDealt / gamesPlayed,
      minesCaptured: this.get('lifetimeStats').minesCaptured / gamesPlayed,
      diamondsEarned: this.get('lifetimeStats').diamondsEarned / gamesPlayed,
      healthRecovered: this.get('lifetimeStats').healthRecovered / gamesPlayed,
      gravesRobbed: this.get('lifetimeStats').gravesRobbed / gamesPlayed
    }; 
    return aveStats;
  }

});