var Leaderboard = Backbone.Model.extend({
  
  // give model url attribute for server to handle
  url: '',
  updateViewingParams: function(viewParams) {
    this.url = '/api/leaderboard/' + viewParams.type + '/' + viewParams.stat;
  }
  // // set id attribute so that we can do put requests
  // // backbone looks for 'id' otherwise
  // idAttribute: '_id'

});