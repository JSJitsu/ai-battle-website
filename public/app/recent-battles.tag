<recent-battles>
  <h2>Today's Battles</h2>
  <section>
    <div each={ battle in battles }>
      <span><a href="#game/{ battle.id }">View Battle #{ battle.id }</a></span>
      <ul>
        <li each={ player in battle.players }>{ player }</li>
      </ul>
    </div>
  </section>

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