var UserView = Backbone.View.extend({
  // todo: handlesubmit function should update database
  // when user enters a new repo name
  events: {
    'click #submitRepo': 'handleSubmit'
  },
  handleSubmit: function(event) {
    //update the model with the new form data
    this.model.save();
    event.preventDefault();
  },
  initialize: function() {
    this.render();
    // fetch will get object at model's url
    // can use 'parse' as middleware for object
    $.when(this.model.fetch()).then(function() {
      this.render();
    }.bind(this));
  },

  render: function() {
    var githubHandle = this.model.get('githubHandle');
    if (githubHandle) {
      var html = new EJS({url: '/ejs_templates/loggedIn'}).render(this.model);
      this.$el.html(html);
    } else {
      var html = new EJS({url: '/ejs_templates/notLoggedIn'}).render(this.model);
      this.$el.html(html);
    }
  }

});