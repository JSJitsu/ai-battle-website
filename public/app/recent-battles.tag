<recent-battles>
  <h2>Today's Battles:</h2>
  <div each={ battle in battles }>
    <span>#{ battle.id }</span>
    <ul each={ player in battle.players }>
      <li>{ player }</li>
    </ul>
  </div>

  <script>
    let tag = this;

    tag.on('before-mount', function (e) {
      $.getJSON('/api/games/latest', function (data) {
        tag.battles = data;

        tag.battles.forEach(battle => {
          battle.players.sort();
        });

        tag.update();
      });
    });
  </script>
</recent-battles>