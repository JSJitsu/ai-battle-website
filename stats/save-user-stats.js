var Q = require('q');

//Saves the user stats to the database
//Returns a promise that resolves to the user object
module.exports = function(mongoData, hero, gameId) {
  var userCollection = mongoData.userCollection;
  var deferred = Q.defer();

  //Grab the user from the database
  return Q.ninvoke(userCollection, 'findOne', { githubHandle: hero.name }).then(function(user) {

    //Update the number of the most recently played game
    user.mostRecentGameId = gameId;

    //Update the user's lifetime and most recent stats
    user.lifetimeStats.kills += hero.heroesKilled.length;
    user.mostRecentStats.kills = hero.heroesKilled.length;

    if (hero.dead) {
      user.lifetimeStats.deaths++;
      user.mostRecentStats.survived = false;
    } else {
      user.mostRecentStats.survived = true;
    }

    user.lifetimeStats.damageDealt += hero.damageDone;
    user.mostRecentStats.damageDealt = hero.damageDone;

    user.lifetimeStats.minesCaptured += hero.minesCaptured;
    user.mostRecentStats.minesCaptured = hero.minesCaptured;

    user.lifetimeStats.diamondsEarned += hero.diamondsEarned;
    user.mostRecentStats.diamondsEarned = hero.diamondsEarned;

    user.lifetimeStats.healthRecovered += hero.healthRecovered;
    user.mostRecentStats.healthRecovered = hero.healthRecovered;

    if (user.lifetimeStats.healthGiven) {
      user.lifetimeStats.healthGiven += hero.healthGiven;
    } else {
      user.lifetimeStats.healthGiven = hero.healthGiven;
    }
    
    user.mostRecentStats.healthGiven = hero.healthGiven;

    user.lifetimeStats.gravesRobbed += hero.gravesRobbed;
    user.mostRecentStats.gravesRobbed = hero.gravesRobbed;

    if (hero.won) {
      user.lifetimeStats.wins++;
      user.mostRecentStats.gameResult = 'Win';
    } else {
      user.lifetimeStats.losses++;
      user.mostRecentStats.gameResult = 'Loss';
    }

    return user;

  }).then(function(user) {
    console.log('  Saving stats for user: ' + user.githubHandle);

    //Save the user stats
    return Q.npost(mongoData.userCollection, 'update', [
      {
        '_id': user._id
      }, user, {
        upsert: true
      }
    ]);
  });
};



