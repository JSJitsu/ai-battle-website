var mongoose = require('mongoose');

module.exports = function(mongoConnectionUrl) {
  mongoose.connect(mongoConnectionUrl);

  var UserSchema = mongoose.Schema({
    githubHandle: String,
    codeRepo: {
      type: String,
      default: 'hero-starter'
    },
    codeRepoBranch: {
      type: String,
      default: 'master'
    },
    codeRepoBranch: {
      type: String,
      default: 'master'
    },
    lifetimeStats: {
      kills: Number,
      deaths: Number,
      damageDealt: Number,
      minesCaptured: Number,
      diamondsEarned: Number,
      healthRecovered: Number,
      wins: Number,
      losses: Number
    },
    mostRecentStats: {
      gameResult: String,
      survived: Boolean,
      kills: Number,
      damageDealt: Number,
      minesCaptured: Number,
      diamondsEarned: Number,
      healthRecovered: Number
    }
  });

  //Returns the user model
  return mongoose.model('User', UserSchema);
};