var Q = require('q');
module.exports = function(mongoData) {
  var userCollection = mongoData.userCollection;

  //Saves the user stats to the database
  //Returns a promise that resolves to the user object
  var saveUserStats = function(hero, winningTeam) {
    var deferred = Q.defer();

    //Grab the user from the database
    userCollection.find({ githubHandle: hero.githubHandle }).toArray(function(err, user) {
      if (err) {
        console.log('Error finding user with handle:' + hero.githubHandle + '!');
        console.log(err);
        return;
      }

      //User comes back as an array--fix that
      user = user[0];

      //Update the user stats
      user.lifetimeStats.kills += hero.heroesKilled.length;

      if (hero.dead) {
        user.lifetimeStats.deaths++;
      }
      user.lifetimeStats.damageDealt += hero.damageDone;

      user.lifetimeStats.minesCaptured += hero.minesCaptured;

      user.lifetimeStats.diamondsEarned += hero.diamondsEarned;

      user.lifetimeStats.healthRecovered += hero.healthRecovered;

      user.lifetimeStats.gravesRobbed += hero.gravesRobbed;

      if (hero.team === winningTeam) {
        user.lifetimeStats.wins++;
      } else {
        user.lifetimeStats.losses++;
      }

      //Save the user stats

    }

  };
  return saveUserStats;
};

