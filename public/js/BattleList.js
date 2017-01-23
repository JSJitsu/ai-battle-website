var BattleList = Backbone.View.extend({
    events: {
        'click .game-link': 'scrollToGame'
    },
    model: Backbone.Model.extend({
        url: 'api/games/latest'
    }),
    template: _.template(
        '<a class="game-link" href="#game/<%= id %>">Game #<%= id %> (<% print(players.join(", ")); %>)</a>'
    ),
    initialize: function (config) {
        var view = this;

        view.model = new view.model;

        view.model.on('sync', function (model, records) {
            view.render(records);
        });

        view.model.fetch();
    },
    scrollToGame: function () {
        $('html, body').animate({
            scrollTop: $('#replay').offset().top
        }, 500);
    },
    render: function (records) {
        var html = [];

        for (var i=0; i < records.length; i++) {
            html.push(this.template(records[i]));
        }

        this.$el.html(html.join('<br>'));
    }
});
