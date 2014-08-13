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
    'submit': 'handleSubmit',
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
    // var form = document.getElementsByClassName("form-feedback");
    // var form = $(".form-feedback");
    // console.log(form);
    this.render();
    $(".form-group").addClass("has-success");
    $(".form-group").addClass("has-feedback");
  },

  showSettings: function(event) {
    event.preventDefault();
    this.viewing = "settings";
    this.render();
    $('.settings').tab('show');
  },
  
   showRecent: function(event) {
    event.preventDefault();
    this.viewing = "recent";
    this.render();
    $('.recentStats').tab('show');
  },

   showLifetime: function(event) {
    event.preventDefault();
    this.viewing = "lifetime";
    this.render();
    $('.lifetimeStats').tab('show');
  },

   showAverage: function(event) {
    event.preventDefault();
    this.viewing = "average";
    this.render();
    $('.averageStats').tab('show');
  },

  render: function() {
    var githubHandle = this.model.get('githubHandle');
    var html;
    if (githubHandle && this.viewing === "settings") {
      html = new EJS({url: '/ejs_templates/settings'}).render(this.model);
    } else if (githubHandle && this.viewing === 'lifetime') {
      html = new EJS({url: '/ejs_templates/lifetime'}).render(this.model);
    } else if (githubHandle && this.viewing === 'recent') {
      html = new EJS({url: '/ejs_templates/recent'}).render(this.model);
    } else if (githubHandle && this.viewing === 'average') {
      var averageStats = this.model.average();
      averageStats['githubHandle'] = this.model.get('githubHandle');
      html = new EJS({url: '/ejs_templates/average'}).render(averageStats);
    } else if (!githubHandle) {
      html = new EJS({url: '/ejs_templates/notLoggedIn'}).render(this.model);
    }
    this.$el.html(html);
  }

});