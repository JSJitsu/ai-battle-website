
var Game = Backbone.Model.extend({
  url: 'api/gameData/0/1',
  initialize: function() {
    var userModel = new User();
    this.set('userModel', userModel);
  },
  
  parse: function(response) {
    this.set('turn', response.turn);
    this.set('maxTurn', response.maxTurn);
    this.set('moveMessages', response.moveMessage);
    this.set('attackMessages', response.attackMessage);
    this.set('killMessages', response.killMessage);
    this.set('teamDiamonds', response.totalTeamDiamonds);
    var board = new Board();
    var teamYellow = new Team();
    var teamBlue = new Team();

    board.lengthOfSide = response.board.lengthOfSide;
    //add team yellow hero Models to team collection
    _.each(response.teams[0], function(heroObject){
      heroObject.gameTurn = response.turn;
      heroObject.battleId = heroObject.id;
      delete heroObject.id;

      var hero = new Hero(heroObject);
      teamYellow.add(hero);
    });
    //add team blue hero Models to team collection
    _.each(response.teams[1], function(heroObject){
      heroObject.gameTurn = response.turn;
      heroObject.battleId = heroObject.id;
      delete heroObject.id;

      var hero = new Hero(heroObject);
      teamBlue.add(hero);
    });

    

    _.each(_.flatten(response.board.tiles), function(tileObject, key, list) {
      //The id from our game model was overwriting 
      tileObject.battleId = tileObject.id;
      delete tileObject.id;
      tileObject.gameTurn = this.get('turn');
      var tile = new BoardTile(tileObject);
      board.add(tile);

    }.bind(this));

    this.set('teamYellow', teamYellow);
    this.set('teamBlue', teamBlue);
    this.set('board', board);
  },
  updateTurn: function(turn) {
    this.url = '/api/gameData/0/' + turn;
  }
});