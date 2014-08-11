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
    'click .settings': 'showSettings'
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
  },

  render: function() {
    console.log(this.model);
    var githubHandle = this.model.get('githubHandle');
    if (githubHandle && this.viewing === "settings") {
      var html = new EJS({url: '/ejs_templates/loggedIn'}).render(this.model);
      this.$el.html(html);
    } else {
      var html = new EJS({url: '/ejs_templates/notLoggedIn'}).render(this.model);
      this.$el.html(html);
    }
  }

});