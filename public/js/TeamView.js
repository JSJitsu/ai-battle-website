var TeamView = Backbone.View.extend({
  className: 'list-group',
  tagName: 'ul',
  teamColor: undefined,
  initialize: function(){
    // this.render();
  },
  render: function() {
    this.$el.html('');
    if(this.teamColor){
      this.$el.append('<h4>' + this.teamColor + '</h4>');
    }
    this.createTeamView();
  },
  createTeamView: function() {
    _.each(this.collection.models, function(hero){
      var heroView = new HeroView({
        model: hero
      });
      this.$el.append(heroView.$el);
    }.bind(this));
  }
});