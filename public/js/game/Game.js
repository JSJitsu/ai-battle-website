/* globals Backbone,GameEngine,_ */
/* exported Game */
var Game = Backbone.Model.extend({
  url: 'api/gameDataForUser',
  parse: function(response) {
    var engine = new GameEngine,
        GameClass = engine.getGame(),
        boardSize,
        game;

    boardSize = response.initialMap.length;
    game = new GameClass(boardSize);
    game.board.tiles = response.initialMap;

    console.info(response);

    // Import the existing map to the game
    _.each(response.initialMap, function (xRow) {
      _.each(xRow, function (tile) {
        if (tile.type === 'Hero') {
          tile.type = 'Unoccupied';
          game.addHero(
            tile.distanceFromTop,
            tile.distanceFromLeft,
            tile.name,
            tile.team
          );
        }

        if (tile.type === 'HealthWell') {
          tile.type = 'Unoccupied';
          game.addHealthWell(
            tile.distanceFromTop,
            tile.distanceFromLeft
          );
        }

        if (tile.type === 'DiamondMine') {
          tile.type = 'Unoccupied';
          game.addDiamondMine(
            tile.distanceFromTop,
            tile.distanceFromLeft
          );
        }

        if (tile.type === 'Impassable') {
          tile.type = 'Unoccupied';
          game.addImpassable(
            tile.distanceFromTop,
            tile.distanceFromLeft
          );
        }
      });
    });

    this.set('game', game);
    this.set('events', response.events);
    this.set('maxTurn', response.events.length);

    game.maxTurn = response.events.length - 1;

    /*
    @todo Finish implementing potentially missing features below

    this.set('moveMessages', response.moveMessage);
    this.set('winningTeam', response.winningTeam);
    this.set('attackMessages', response.attackMessage);
    this.set('killMessages', response.killMessage);
    this.set('teamDiamonds', response.totalTeamDiamonds);
    */
  }
});