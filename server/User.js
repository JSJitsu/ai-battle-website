var mongoose = require('mongoose');

module.exports = function(mongoConnectionUrl) {
  mongoose.connect(mongoConnectionUrl);

  var UserSchema = mongoose.Schema({
    githubHandle: String,
    mostRecentGameId: {
      type: String,
      default: ''
    },
    port: Number,
    codeRepo: {
      type: String,
      default: 'hero-starter'
    },
    codeRepoBranch: {
      type: String,
      default: 'master'
    },
    lifetimeStats: {
      kills: {
        type: Number,
        default: 0
      },
      deaths: {
        type: Number,
        default: 0
      },
      damageDealt: {
        type: Number,
        default: 0
      },
      minesCaptured: {
        type: Number,
        default: 0
      },
      diamondsEarned: {
        type: Number,
        default: 0
      },
      healthRecovered: {
        type: Number,
        default: 0
      },
      healthGiven: {
        type: Number,
        default: 0
      },
      gravesRobbed: {
        type: Number,
        default: 0
      },
      wins: {
        type: Number,
        default: 0
      },
      losses: {
        type: Number,
        default: 0
      }
    },
    mostRecentStats: {
      gameResult: {
        type: String,
        default: 'N/A'
      },
      survived: Boolean,
      kills: Number,
      damageDealt: Number,
      minesCaptured: Number,
      diamondsEarned: Number,
      healthRecovered: Number,
      healthGiven: Number,
      gravesRobbed: Number
    }
  });

  //Returns the user model
  return mongoose.model('User', UserSchema);
};