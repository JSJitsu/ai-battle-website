var UserView = Backbone.View.extend({

  initialize: function() {
    var view = this;

    view.viewing = {};
    view.viewing = 'settings';
    view.render();

    view.model.on('change', view.render, view);
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
    var val = this.$el.find('#inputRepo').val();
    var codeRepo = this.model.get('code_repo');
    // do not process if an empty string or equal to current code repo
    if (val.length !== 0 && val !== codeRepo) {
      // update the model with the new form data
      // escape the form input for security
      this.model.set('code_repo', _.escape(val));
      //Save the model
      this.model.save();
      this.render();
      // display form as updated with check mark and green highlight
      this.$el.find(".form-group").addClass("has-success");
      this.$el.find(".form-group").addClass("has-feedback");
    } else {
      // if empty string or equal to current code repo do not display as updated
      this.$el.find(".form-group").removeClass("has-success");
      this.$el.find(".form-group").removeClass("has-feedback");
      // render to get current code repo value displayed rather than empty string
      this.render();
    }
  },

  showSettings: function(event) {
    event.preventDefault();
    this.viewing = "settings";
    this.render();
    this.$el.find('.settings').tab('show');
  },

   showRecent: function(event) {
    event.preventDefault();
    this.viewing = "recent";
    this.render();
    this.$el.find('.recentStats').tab('show');
  },

   showLifetime: function(event) {
    event.preventDefault();
    this.viewing = "lifetime";
    this.render();
    this.$el.find('.lifetimeStats').tab('show');
  },

   showAverage: function(event) {
    event.preventDefault();
    this.viewing = "average";
    this.render();
    this.$el.find('.averageStats').tab('show');
  },

  render: function() {
    var githubHandle = this.model.get('github_login');
    var html;
    if (githubHandle && this.viewing === "settings") {
      html = new EJS({url: '/ejs_templates/settings'}).render(this.model);
    } else if (githubHandle && this.viewing === 'lifetime') {
      html = new EJS({url: '/ejs_templates/lifetime'}).render(this.model);
    } else if (githubHandle && this.viewing === 'recent') {
      html = new EJS({url: '/ejs_templates/recent'}).render(this.model);
    } else if (githubHandle && this.viewing === 'average') {
      var averageStats = this.model.average();
      averageStats['githubHandle'] = this.model.get('github_login');
      html = new EJS({url: '/ejs_templates/average'}).render(averageStats);
    } else if (!githubHandle) {
      html = new EJS({url: '/ejs_templates/notLoggedIn'}).render(this.model);
    }
    this.$el.html(html);
  }

});