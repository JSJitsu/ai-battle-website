var UserView = Backbone.View.extend({
  
  initialize: function() {
    this.viewing = {};
    this.viewing = "settings";
    this.render();
    // fetch will get object at model's url
    // can use 'parse' as middleware for object
    // jQuery promise
    $.when(this.model.fetch()).then(function() {
      this.render();
    }.bind(this));
  },

  events: {
    'submit' : 'handleSubmit',
    'click .settings': 'showSettings',
    'click .recentStats': 'showRecent',
    'click .lifetimeStats': 'showLifetime',
    'click .averageStats': 'showAverage'
  },

  handleSubmit: function(event) {
    console.log('submit button clicked');
    event.preventDefault();
    var val = $('#inputRepo').val();
    console.log('val: ', val);
    // update the model with the new form data
    this.model.set('codeRepo', val);
    // This line helps backbone realize that
    // we need to send a PUT request
    // (that is ALL it does here)
    this.model.set('id', 0);
    //Save the model
    this.model.save();
    console.log(this.model.attributes);
    this.render();
  },

  showSettings: function(event) {
    console.log('settings clicked');
    this.viewing = "settings";
    event.preventDefault();
    this.render();
  },
  
   showRecent: function(event) {
    console.log('recent clicked');
    this.viewing = "recent";
    event.preventDefault();
    this.render();
  },

   showLifetime: function(event) {
    console.log('lifetime clicked');
    this.viewing = "lifetime";
    event.preventDefault();
    this.render();
  },

   showAverage: function(event) {
    console.log('average clicked');
    this.viewing = "average";
    event.preventDefault();
    this.render();
  },

  render: function() {
    console.log(this.model);
    var githubHandle = this.model.get('githubHandle');
    if (githubHandle && this.viewing === "settings") {
      var html = new EJS({url: '/ejs_templates/settings'}).render(this.model);
    } else if (githubHandle && this.viewing === 'lifetime') {
      var html = new EJS({url: '/ejs_templates/lifetime'}).render(this.model);

      // console.log('canvas jquery: ', $("#lifetimeStatsChart"));
      // // console.log('canvas getelement: ', document.getElmentById("lifetimeStatsChart"));
      // var canvas = $("#lifetimeStatsChart"); 
      // console.log('canvas: ', canvas);
      // console.log('canvas get 0: ', canvas.get(0));
      // var context = canvas.get(0).getContext("2d");
      // var myChart = new Chart(context);
      // var options = {
      //   scaleBeginAtZero: true,
      //   scaleShowGridLines: true,
      //   scaleGridLineColor: "rgba(0,0,0,0.05)",
      //   scaleGridLineWidth: 1,
      //   barShowStroke: true,
      //   barStrokeWidth: 2,
      //   barValueSpacing: 5,
      //   barDatasetSpacing: 1
      // };
      // var lifetimeStatsChart = new Chart(context).Bar(this.model.lifetimeStats, options);
    } else {
      console.log(this.model);
      var html = new EJS({url: '/ejs_templates/notLoggedIn'}).render(this.model.attributes);
    }
    this.$el.html(html);
  }

});