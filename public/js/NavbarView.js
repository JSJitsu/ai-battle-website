var NavbarView = Backbone.View.extend({

  initialize: function(){
    this.render();
    $.when(this.model.fetch()).then(function() {
      this.render();
    }.bind(this));
  },

  render: function(){
    var html;
    var githubHandle = this.model.get('githubHandle');

    if(githubHandle) {
      html = new EJS({url: '../ejs_templates/navbar'}).render(this.model);
    } else {
      html = new EJS({url: '../ejs_templates/navbarNotLoggedIn'}).render(this.model);
    }
    
    this.$el.html(html);
  }
});