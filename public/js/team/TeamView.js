/* globals Backbone,HeroView,_ */
/* exported TeamView */
var TeamView = Backbone.View.extend({
  className: 'list-group',
  tagName: 'div',
  teamColor: undefined,
  render: function() {
    this.$el.html('');
    if(this.teamColor){
      this.$el.append('<h5 class="team-name">' + this.teamColor + ' diamonds: ' + this.diamonds + '</h5>');
    }
    this.createTeamView();
  },
  createTeamView: function() {
    _.each(this.collection, function(hero){
      var heroView = new HeroView({
        model: hero
      });
      this.$el.append(heroView.$el);
    }.bind(this));
  }
});