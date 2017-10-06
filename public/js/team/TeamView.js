/* globals Backbone,HeroView,_ */
/* exported TeamView */
Backbone.View.extend({
    className: 'list-group',
    tagName: 'div',
    render: function () {
        this.$el.html('');
        if (this.teamColor){
            this.$el.append('<div class="team-name">' + this.teamColor + '</div>' +
                '<div class="team-diamonds">Diamonds: ' + this.diamonds + '</div>');
        }
        this.createTeamView();
    },
    createTeamView: function () {
        _.each(this.collection, function (hero){
            var heroView = new HeroView({
                model: hero
            });
            this.$el.append(heroView.$el);
        }.bind(this));
    }
});
