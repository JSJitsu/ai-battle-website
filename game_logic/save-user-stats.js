var Q = require('q');

//Saves the user stats to the database
//Returns a promise that resolves to the user object
module.exports = function(mongoData, hero) {
  console.log('got here1');
  var userCollection = mongoData.userCollection;
  var deferred = Q.defer();

  //Grab the user from the database
  return Q.ninvoke(userCollection, 'findOne', { githubHandle: hero.name }).then(function(user) {

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

    if (hero.won) {
      user.lifetimeStats.wins++;
    } else {
      user.lifetimeStats.losses++;
    }

    return user;

  }).then(function(user) {
    console.log('  Saving stats for user: ' + user.githubHandle);

    //Save the user stats
    return Q.npost(mongoData.userCollection, 'update', [
      {
        '_id':user._id
      }, user, {
        upsert:true
      }
    ]);
  });
};



