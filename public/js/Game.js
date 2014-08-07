
var Game = Backbone.Model.extend({
  url: 'api/gameData/0/1',
  initialize: function() {
  },
  
  parse: function(response) {
    this.set('turn', response.turn);
    this.set('moveMessages', response.moveMessage);
    this.set('attackMessages', response.attackMessage);
    this.set('killMessages', response.killMessage);
    var board = new Board();
    var teamYellow = new Team();
    var teamBlue = new Team();

    board.lengthOfSide = response.board.lengthOfSide;
    //add team yellow hero Models to team collection
    _.each(response.teams[0], function(heroObject){
      heroObject.turn = response.turn;
      heroObject.battleId = heroObject.id;
      delete heroObject.id;

      var hero = new Hero(heroObject);
      teamYellow.add(hero);
    });
    //add team blue hero Models to team collection
    _.each(response.teams[1], function(heroObject){
      heroObject.turn = response.turn;
      heroObject.battleId = heroObject.id;
      delete heroObject.id;

      var hero = new Hero(heroObject);
      teamBlue.add(hero);
    });

    

    _.each(_.flatten(response.board.tiles), function(tileObject, key, list) {
      //The id from our game model was overwriting 
      tileObject.battleId = tileObject.id;
      delete tileObject.id;
      var tile = new BoardTile(tileObject);
      board.add(tile);

    });
    this.set('teamYellow', teamYellow);
    this.set('teamBlue', teamBlue);
    this.set('board', board);
  },
  updateTurn: function(turn) {
    this.url = '/api/gameData/0/' + turn;
  }
});