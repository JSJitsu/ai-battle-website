<battle>
  <h2>{ boardWidth } x { boardHeight } Battle!</h2>
  <canvas ref="battle_canvas"></canvas>

  <script>
    let tag = this;

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