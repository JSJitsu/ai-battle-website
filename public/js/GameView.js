var GameView = Backbone.View.extend({
  tagName: 'div',
  className: 'game-view',
  initialize: function(){
    this.updateTurn(1);
    //what to operate on
    // var turn = $("#turn").html();
    //compiling handlebars
    // this.turnTemplate = Handlebars.compile(turn);
  },

  render: function(){
  	this.$el.html('');

    //Show game update messages
    this.$el.append('<div class="messages"></div>');
    $('.messages').append(this.model.get('killMessages'));
       //Add html for team info
    var yellowTeamView = new TeamView({
      collection: this.model.get('teamYellow'),
      className: 'team-info-y',
    });
    yellowTeamView.teamColor = 'Team Yellow';
    yellowTeamView.render();
    var blueTeamView = new TeamView({
      collection: this.model.get('teamBlue'),
      className: 'team-info-b'
    });
    blueTeamView.teamColor = 'Team Blue';
    blueTeamView.render()

    


    // this.el.append(this.model.get('messages'));
    
    //for handlebars template
    // this.context = {round: this.model.get('turn')};


    //Show turn counter
    // var turnHtml = this.turnTemplate(this.context);
    // this.$el.append(turnHtml);


    //Add all board html
    this.$el.append(yellowTeamView.$el)
    this.$el.append(blueTeamView.$el)
    var boardView = new BoardView({collection: this.model.get('board')});
    this.$el.append(boardView.$el);
    
    // var heroesArray = this.model.get('heroes');


 

  
  },
  updateTurn: function(turn) {
    this.model.updateTurn(turn); 
    this.model.fetch({
      success: this.render.bind(this),
      error: function(collection, response, options){
        console.log('error', response);
      }
    });
  }
});
