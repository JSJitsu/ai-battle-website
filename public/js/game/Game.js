/* globals Backbone,GameEngine,_ */
/* exported Game */
var Game = Backbone.Model.extend({
  url: 'api/gameData',
  parse: function(response) {
    if (!response) {
      this.onGameDataNotFound();
    } else {
      this.onGameDataFound(response);
    }
  },
  onGameDataNotFound: function () {
    this.set('noGameData', true);
  },
  onGameDataFound: function (response) {
    var model = this;

    model.set('initialMap', response.initialMap);
    model.set('events', response.events);
    model.set('maxTurn', response.events.length);

    model.set('game', model.createGame(response.initialMap));
  },
  /**
   * Creates a new game using the initial map.
   * @param  {Object} map  Initial map state
   * @return {Game} New game object
   */
  createGame: function (map) {
    var boardSize = map.length,
        engine = new GameEngine(),
        GameClass = engine.getGame(),
        game = new GameClass(boardSize),
        events = this.get('events');

    this.set('turn', 0);
    game.maxTurn = events.length - 1;

    _.each(map, function (xRow) {
      _.each(xRow, function (tile) {
        if (tile.type === 'Hero') {
          game.addHero(
            tile.distanceFromTop,
            tile.distanceFromLeft,
            tile.name,
            tile.team
          );
        }

        if (tile.type === 'HealthWell') {
          game.addHealthWell(
            tile.distanceFromTop,
            tile.distanceFromLeft
          );
        }

        if (tile.type === 'DiamondMine') {
          game.addDiamondMine(
            tile.distanceFromTop,
            tile.distanceFromLeft
          );
        }

        if (tile.type === 'Impassable') {
          game.addImpassable(
            tile.distanceFromTop,
            tile.distanceFromLeft
          );
        }
      });
    });

    return game;
  },
  /**
   * @public
   *
   * Jumps to a specific turn in the game by creating a new game and playing
   * all of the turns needed to reach the given turn.
   *
   * @param  {Number} turn The turn to jump to
   * @return {Game}      The game class
   */
  jumpToTurn: function (turn) {
    console.info('Jumping to turn', turn);

    var me = this,
        initialMap = this.get('initialMap'),
        events = this.get('events'),
        game = this.createGame(initialMap);

    _.find(events, function (eventData, index) {
      if (index < turn) {
        var heroAction = me.translateEnumToAction(eventData[1]);

        game.handleHeroTurn(heroAction);
      } else {
        return true;
      }
    });

    this.set('game', game);
    this.set('turn', turn);

    return game;
  },
  /**
   * Go the next turn of the game, if possible.
   * @return {Boolean} True if turn happened.
   */
  nextTurn: function () {
    var game = this.get('game'),
        events = this.get('events'),
        turn = game.turn,
        heroAction;

    if (events[turn] !== undefined) {
      heroAction = this.translateEnumToAction(events[turn][1]);
      game.handleHeroTurn(heroAction);
      this.set('turn', turn + 1);

      return true;
    }

    return false;
  },
  /**
   * @todo  Do this on the server side?
   */
  translateEnumToAction: function (enumerable) {
    var constants = {
      1: 'North',
      2: 'East',
      3: 'South',
      4: 'West'
    };

    return constants[enumerable];
  }
});