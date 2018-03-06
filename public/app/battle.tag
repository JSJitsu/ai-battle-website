<battle>
  <style>

    .battle-board {
      display: flex;
      flex-direction: row;
      overflow: hidden;
    }

    .battle-tile {
      width: 64px;
      height: 64px;
      background: url(../img/grass_square.gif);
    }

    .battle-tile .small-tile {
      margin: 16px;
    }

  </style>
  <h2>{ boardWidth } x { boardHeight } Battle!</h2>
  <div class="battle-board" ref="battle_canvas" if={ battle }>
    <div class="battle-row" each={ row, i in game.board.tiles }>
      <div class="battle-tile" each={ tile, j in row }>
        <img src="img/tree.png" if={ tile.subType === 'Tree' }>
        <img class="small-tile" src="img/diamond_mine.png" if={ tile.subType === 'DiamondMine' }>
        <img class="small-tile" src="img/healing_well.gif" if={ tile.subType === 'HealthWell' }>
        <img class="small-tile" src="img/blue_knight.gif" if={ tile.subType === 'BlackKnight' }>
        <img class="small-tile" src="img/red_knight.gif" if={ tile.subType === 'Adventurer' }>
      </div>
    </div>
  </div>
  <div class="play-controls">
    <span class="play-pause-game glyphicon glyphicon-play"></span>
    <span class="restart-game glyphicon glyphicon-repeat"></span>
  </div>
  <script>
    let tag = this;

    route('/game/*', function (id) {
      loadGame(id);
    });

    function loadGame (id) {
      $.getJSON('api/game/' + id, function (data) {
        tag.battle = data;

        console.debug(tag);
        console.debug(data);

        tag.update();
      });
    }

    /**
     * Creates a new game using the initial map.
     * @param  {Object} map
     *     Initial map state
     * @return {Game}
     *     New game object
     */
    function createGame (map) {
      let boardSize = map.length;
      let engine = new GameEngine();
      let GameClass = engine.getGame();
      let game = new GameClass(boardSize);
      let events = tag.events;

      game.maxTurn = events.length;

      $.each(map, function (y, row) {
        $.each(row, function (x, tile) {
          setupGameTile(game, tile);
        });
      });

      // Because we aren't adding heroes in the correct order, we need to sort them by ID to ensure
      // nobody goes out of turn.
      game.heroes.sort(function (a, b) {
          return a.id - b.id;
      });

      return game;
    }

    function setupGameTile (game, tile) {
      let tileAdder = game[`add${tile.type}`];

      if ($.isFunction(tileAdder)) {
        tileAdder.call(
          game,
          tile.distanceFromTop,
          tile.distanceFromLeft,
          tile.name,
          tile.team,
          tile.id
        );
      } else if (tile.type !== 'Unoccupied') {
        throw new Error(`No method found to add tile type of "${tile.type}"`);
      }
    }

    /**
     * @public
     *
     * Jumps to a specific turn in the game by creating a new game and playing
     * all of the turns needed to reach the given turn.
     *
     * @param  {Number} turn
     *     The turn to jump to
     * @return {Game}
     *     The game class
     */
    function jumpToTurn (turn) {
      let initialMap = tag.initialMap;
      let events = tag.events;
      let game = tag.createGame(initialMap);

      $.each(events, function (index, eventData) {
        if (index < turn) {
          game.handleHeroTurn(eventData.action);
        } else {
          return false;
        }
      });

      tag.game = game;

      return game;
    }

    /**
     * Go the next turn of the game, if possible.
     * @return {Boolean} True if turn happened.
     */
    this.nextTurn = function nextTurn () {
      let game = tag.game;
      let events = tag.events;
      let turn = game.turn;
      let heroAction;

      if (events[turn] !== undefined) {
        heroAction = events[turn].action;
        game.handleHeroTurn(heroAction);

        tag.update();

        return true;
      }

      return false;
    };

    tag.on('before-mount', function (e) {
      $.getJSON('api/game', function (data) {
        tag.battle = data;

        tag.boardHeight = tag.battle.initial_map.length;
        tag.boardWidth = tag.battle.initial_map[0].length;
        tag.initialMap = tag.battle.initial_map;
        tag.events = tag.battle.events;
        tag.maxTurn = tag.battle.events.length;
        tag.isLatest = tag.latest;
        tag.game = createGame(tag.initialMap);

        tag.update();
      });
    });

  </script>
</battle>