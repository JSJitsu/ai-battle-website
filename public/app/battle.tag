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
    <div class="battle-row" each={ row, i in battle.initial_map }>
      <div class="battle-tile" each={ tile, j in row }>
        <img src="img/tree.png" if={ tile.subType === 'Tree' }>
        <img class="small-tile" src="img/diamond_mine.png" if={ tile.subType === 'DiamondMine' }>
        <img class="small-tile" src="img/healing_well.gif" if={ tile.subType === 'HealthWell' }>
        <img class="small-tile" src="img/blue_knight.gif" if={ tile.subType === 'BlackKnight' }>
        <img class="small-tile" src="img/red_knight.gif" if={ tile.subType === 'Adventurer' }>
      </div>
    </div>
  </div>
  <script>
    let tag = this;

    route('/game/*', function (id) {
      console.debug(id)
      loadGame(id);
    });

    function loadGame (id) {
      $.getJSON('api/game/' + id, function (data) {
        tag.battle = data;

        console.debug(data);

        tag.update();
      });
    }

    tag.on('before-mount', function (e) {
      $.getJSON('api/game', function (data) {
        tag.battle = data;

        tag.boardHeight = tag.battle.initial_map.length;
        tag.boardWidth = tag.battle.initial_map[0].length;

        console.debug(data);

        tag.update();
      });
    });

    tag.on('mount', function (e) {
      console.debug(this.refs.battle_canvas);
    });
  </script>
</battle>