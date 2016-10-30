var UserView = Backbone.View.extend({

    initialize: function () {
        var view = this;

        view.render();

        view.model.on('change', view.render, view);
    },

    events: {
        'submit': 'handleSubmit',
        'click .btn-group': 'toggleActive',
        'click .settings': 'showSettings',
        'click .recentGames': 'showGames',
        'click .recentStats': 'showRecent',
        'click .lifetimeStats': 'showLifetime',
        'click .averageStats': 'showAverage',
        'click .game-link': 'scrollToGame'
    },

    handleSubmit: function (event) {
        event.preventDefault();
        var val = this.$el.find('#inputRepo').val();
        var codeRepo = this.model.get('code_repo');
    // do not process if an empty string or equal to current code repo
        if (val.length !== 0 && val !== codeRepo) {
      // update the model with the new form data
      // escape the form input for security
            this.model.set('code_repo', _.escape(val));
      // Save the model
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
            this.showSettings();
        }
    },

    toggleActive: function (activeEvent) {
        this.$el.find('.btn-group > button').removeClass('active');

        $(activeEvent.target).addClass('active');
    },

    showSettings: function (event) {
        this.$el.find('#userview-contents').html(
            new EJS({ url: '/ejs_templates/settings' }).render(this.model)
        );
    },

    showGames: function (event) {
        var me = this;

        me.model.fetchGames(function () {
            me.$el.find('#userview-contents').html(
                new EJS({ url: '/ejs_templates/games' }).render(me.model)
            );
        });
    },

    showRecent: function (event) {
        var me = this;

        me.model.fetchRecent(function () {
            me.$el.find('#userview-contents').html(
                new EJS({ url: '/ejs_templates/recent' }).render(me.model)
            );
        });
    },

    showLifetime: function (event) {
        this.$el.find('#userview-contents').html(
            new EJS({ url: '/ejs_templates/lifetime' }).render(this.model.get('lifetime_stats'))
        );
    },

    showAverage: function (event) {
        event.preventDefault();
        var me = this;

        me.model.fetchAverage(function () {
            me.$el.find('#userview-contents').html(
                new EJS({ url: '/ejs_templates/average' }).render(me.model.get('average_stats'))
            );
        });
    },

    scrollToGame: function () {
        $('html, body').animate({
            scrollTop: $('#replay').offset().top
        }, 500);
    },

    render: function () {
        var githubHandle = this.model.get('github_login');
        var html;

        if (!githubHandle) {
            html = new EJS({ url: '/ejs_templates/notLoggedIn' }).render(this.model);
        } else {
            html = new EJS({ url: '/ejs_templates/userview' }).render({
                username: githubHandle,
                contents: new EJS({ url: '/ejs_templates/settings' }).render(this.model)
            });
        }

        this.$el.html(html);
    }

});