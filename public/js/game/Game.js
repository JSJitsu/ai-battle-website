/* globals Backbone,GameEngine,_ */
/* exported Game */
Backbone.Model.extend({
    url: 'api/game/' + location.hash.split('/')[1],
    parse: function (response) {
        if (!response || response.noData) {
            this.onGameDataNotFound();
        } else {
            this.onGameDataFound(response);
        }
    },
    setGameId: function (id) {
        this.url = 'api/game';

        if (id) {
            this.url += '/' + id;
        }
    },
    onGameDataNotFound: function () {
        this.set('noGameData', true);
    },
    onGameDataFound: function (response) {
        var model = this,
            map = response.initial_map;

        model.set('initialMap', map);
        model.set('events', response.events);
        model.set('maxTurn', response.events.length);

        model.set('raw', response);
        model.set('game', model.createGame(map));
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
        game.maxTurn = events.length;

        _.each(map, function (xRow) {
            _.each(xRow, function (tile) {
                if (tile.type === 'Hero') {
                    game.addHero(
            tile.distanceFromTop,
            tile.distanceFromLeft,
            tile.name,
            tile.team,
            tile.id
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

    // Because we aren't adding heroes in the correct order, we need to sort them by ID to ensure
    // nobody goes out of turn.
        game.heroes.sort(function (a, b) {
            return a.id - b.id;
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
            initialMap = me.get('initialMap'),
            events = me.get('events'),
            game = me.createGame(initialMap);

        _.find(events, function (eventData, index) {
            if (index < turn) {
                var heroAction = eventData.action;

                game.handleHeroTurn(heroAction);
            } else {
                return true;
            }
        });

        me.set('game', game);
        me.set('turn', turn);

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
            heroAction = events[turn].action;
            game.handleHeroTurn(heroAction);
            this.set('turn', turn + 1);

            return true;
        }

        return false;
    }
});
