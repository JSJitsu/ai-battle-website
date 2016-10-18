var NavbarView = Backbone.View.extend({

    initialize: function (){
        var view = this;

        view.render();
        view.model.on('change', view.render, view);
    },

    render: function (){
        var html;
        var githubHandle = this.model.get('github_login');

    // if logged in
        if (githubHandle) {
            html = new EJS({url: '../ejs_templates/navbar'}).render(this.model);
        } else {
            html = new EJS({url: '../ejs_templates/navbarNotLoggedIn'}).render(this.model);
        }

        this.$el.html(html);
    }
});