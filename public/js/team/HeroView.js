/* globals Backbone */
/* exported HeroView */
module.exports = Backbone.View.extend({
    className: 'list-group-item list-group-item-info score-info',
    tagName: 'li',
    initialize: function () {
        this.render();
    },
    render: function () {
        var colors;
        var heroId = this.model.id;
        var health = this.model.health;
        var name = this.model.name;

        colors = {
            0: 'team-blue',
            1: 'team-red'
        };

        if (health < 1){
            this.$el.removeClass('list-group-item-info').addClass('list-group-item-danger');
            health = 'Dead';
        } else {
            health =  health + 'HP';
        }
        var heroName = '<div class="hero-header h-i' + heroId + '">' +
      '<span class="indicator team-' + colors[this.model.team] + '">' + heroId + '</span>' +
      '<a href="https://github.com/' + encodeURIComponent(name) + '/hero-starter">' +
      name + '</a>' + ' </div>';
        var heroHP = '<div class="health-info h-i' + heroId + '">' + health + '</div>';
        this.$el.append(heroName + heroHP);
    }
});
