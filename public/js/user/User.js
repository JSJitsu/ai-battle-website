var User = Backbone.Model.extend({
  
  // give model url attribute for server to handle
  url: '/userInfo',

  // set id attribute so that we can do put requests
  // backbone looks for 'id' otherwise
  idAttribute: '_id',

  average: function() {
    var gamesPlayed = this.get('lifetimeStats').wins + this.get('lifetimeStats').losses;
    var that = this;

    var numbersForDisplay = function(prop) {
      return (Number(parseFloat(that.get('lifetimeStats')[prop] / gamesPlayed).toFixed(2)) || 0) + ' per game';
    };

    var aveStats = {
      gamesPlayed: gamesPlayed,
      kills: numbersForDisplay('kills'),
      deaths: numbersForDisplay('deaths'),
      damageDealt: numbersForDisplay('damageDealt'),
      minesCaptured: numbersForDisplay('minesCaptured'),
      diamondsEarned: numbersForDisplay('diamondsEarned'),
      healthRecovered: numbersForDisplay('healthRecovered'),
      gravesRobbed: numbersForDisplay('gravesRobbed')
    }; 
    return aveStats;
  }

});