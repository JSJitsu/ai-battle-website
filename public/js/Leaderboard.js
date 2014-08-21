var Leaderboard = Backbone.Model.extend({
  
  // give model url attribute for server to handle
  url: '/api/leaderboard/lifetime/kills',
  updateLeaderboard: function(params) {
    console.log('updating');
    this.url = '/api/leaderboard/' + params.type + '/' + params.stat;
  }

});