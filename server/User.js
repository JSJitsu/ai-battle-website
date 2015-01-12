
var User = function(githubHandle) {
  this.githubHandle = githubHandle;
  this.mostRecentGameId = '';
  this.port = 0;
  this.codeRepo = 'hero-starter';
  this.codeRepoBranch = 'master';
  this.lifetimeStats = {
    kills: 0,
    deaths: 0,
    damageDealt: 0,
    minesCaptured: 0,
    diamondsEarned: 0,
    healthRecovered: 0,
    healthGiven: 0,
    gravesRobbed: 0,
    wins: 0,
    losses: 0
  };
  this.mostRecentStats = {
    gameResult: 'N/A',
    survived: false,
    kills: 0,
    damageDealt: 0,
    minesCaptured: 0,
    diamondsEarned: 0,
    healthRecovered: 0,
    healthGiven: 0,
    gravesRobbed: 0
  };
};

module.exports = User;

