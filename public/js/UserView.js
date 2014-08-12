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
    event.preventDefault();
    var val = $('#inputRepo').val();
    // update the model with the new form data
    this.model.set('codeRepo', val);
    // This line helps backbone realize that
    // we need to send a PUT request
    // (that is ALL it does here)
    this.model.set('id', 0);
    //Save the model
    this.model.save();
    this.render();
  },

  showSettings: function(event) {
    this.viewing = "settings";
    event.preventDefault();
    this.render();
  },
  
   showRecent: function(event) {
    this.viewing = "recent";
    event.preventDefault();
    this.render();
  },

   showLifetime: function(event) {
    this.viewing = "lifetime";
    event.preventDefault();
    this.render();
  },

   showAverage: function(event) {
    this.viewing = "average";
    event.preventDefault();
    this.render();
  },

  render: function() {
    var githubHandle = this.model.get('githubHandle');
    if (githubHandle && this.viewing === "settings") {
      var html = new EJS({url: '/ejs_templates/settings'}).render(this.model);
    } else if (githubHandle && this.viewing === 'lifetime') {
      var html = new EJS({url: '/ejs_templates/lifetime'}).render(this.model);
    } else if (githubHandle && this.viewing === 'recent') {
      var html = new EJS({url: '/ejs_templates/recent'}).render(this.model);
    } else if (githubHandle && this.viewing === 'average') {
      var html = new EJS({url: '/ejs_templates/average'}).render(this.model);
    } else if (!githubHandle) {
      var html = new EJS({url: '/ejs_templates/notLoggedIn'}).render(this.model.attributes);
    }
    this.$el.html(html);
  }

});