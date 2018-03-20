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
      border: 1px dotted #10380d80;
      position: relative;
    }

    .battle-tile .small-tile {
      margin: 16px;
    }

    .battle-tile.scenery {
      z-index: 1;
    }

    .end-message {
      width: 100%;
      background-color: rgba(44, 44, 44, 0.8);
      position: absolute;
      top: 350px;
      z-index: 1;
      font-size: 2em;
      text-align: center;
      font-family: "Press Start 2P";
      padding: 0.5em;
    }

    .messages {
      top: 2vw;
      width: 100%;
      font-size: 21px;
      height: 30px;
      color: white;
      text-align: center;
      font-family: "Press Start 2P";
    }

    .tile-name {
      position: absolute;
      color: #fff;
      font-size: 6px;
      font-family: "Press Start 2P";
      padding: 2px 2px 2px 3px;
      border: solid 1px #ffffff80;
      width: 62px;
      z-index: 2;
    }

  </style>
  <h2>{ title }</h2>
  <div class="messages">{ game.killMessage || game.attackMessage }</div>
  <div class="battle-board" ref="battle_canvas" if={ battle }>
    <div class="end-message" if={ game.ended }>
      Some team won!
    </div>
    <div class="battle-row" each={ row, i in game.board.tiles }>
      <div class="battle-tile { tile.type === 'Impassable' ? 'scenery' : '' }" each={ tile, j in row }>
        <img src="img/tree.png" if={ tile.subType === 'Tree' }>
        <img class="small-tile" src="img/diamond_mine.png" if={ tile.subType === 'DiamondMine' }>
        <img class="small-tile" src="img/healing_well.gif" if={ tile.subType === 'HealthWell' }>
        <div if={ tile.type === 'Hero' } class="tile-name" style="background: linear-gradient(to right, hsl({ tile.health * 1.2 }, 40%, 30%) 0%, hsl({ tile.health * 1.2 }, 80%, 30%) { tile.health }%, #ffffff40 0%);">{tile.name}</div>
        <img class="small-tile" src="img/blue_knight.gif" if={ tile.subType === 'BlackKnight' }>
        <img class="small-tile" src="img/red_knight.gif" if={ tile.subType === 'Adventurer' }>
      </div>
    </div>
  </div>
  <div class="battle-controls">
    Turn: { game.turn }
    <input type="range" min="0" max={ game.maxTurn } value={ game.turn } oninput={ jumpToTurn }>
    <a class="stop-game" onclick={ stopGame }>⏹ Stop</a>
    <a class="play-pause-game" onclick={ toggleAutoPlay }>
      <virtual if={ ticker }>⏸ Pause</virtual>
      <virtual if={ !ticker }>⏵ Play</virtual>
    </a>
  </div>
  <script>
    let tag = this;
    let gameSpeed = 500;

    route('/game/*', function (id) {
      fetchGame(id);
    });

    function fetchGame (id) {
      $.getJSON(`api/game/${id}`, loadGame);
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

    stopGame () {
      tag.stopAutoPlay();
      tag.jumpToTurn(0);
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
    jumpToTurn (turn) {
      if (typeof turn !== 'number') {
        turn.preventUpdate = true;
        turn = parseInt(turn.target.value, 10);
      }

      let initialMap = tag.initialMap;
      let events = tag.events;
      let game = createGame(initialMap);

      tag.game = game;

      while (turn > 0) {
        tag.nextTurn(true);
        turn--;
      }

      tag.update();
    }

    toggleAutoPlay () {
      if (!tag.ticker) {
        tag.ticker = setInterval(tag.nextTurn, gameSpeed);
      } else {
        tag.stopAutoPlay();
      }
    }

    stopAutoPlay () {
      if (tag.ticker) {
        clearInterval(tag.ticker);
        tag.ticker = null;
      }
    }

    /**
     * Go the next turn of the game, if possible.
     *
     * @param {Boolean} skipUpdate
     *     Prevents the tag from being updated when true.
     */
    tag.nextTurn = function nextTurn (skipUpdate) {
      let game = tag.game;
      let events = tag.events;
      let turn = game.turn;
      let heroAction;

      if (events[turn] !== undefined) {
        heroAction = events[turn].action;
        game.handleHeroTurn(heroAction);

        if (skipUpdate !== true) {
          tag.update();
        }
      }
    };

    function loadGame (data) {
      tag.gameId = data.id;
      tag.title = `Battle #${data.id}`;
      tag.battle = data;

      tag.boardHeight = tag.battle.initial_map.length;
      tag.boardWidth = tag.battle.initial_map[0].length;
      tag.initialMap = tag.battle.initial_map;
      tag.events = tag.battle.events;
      tag.maxTurn = tag.battle.events.length;
      tag.isLatest = tag.latest;
      tag.game = createGame(tag.initialMap);

      tag.update();
    }

    tag.on('before-mount', function (e) {
      $.getJSON('api/game', loadGame);
    });

  </script>
</battle>