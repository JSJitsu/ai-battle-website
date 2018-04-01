<leaderboard>
  <h2>Leaderboard</h2>
  <label for="leaderboard-category">sorted by</label>
  <select id="leaderboard-category" name="category" onchange={ onCategoryChange } ref="statCategory">
    <option value="games_won">Wins</option>
    <option value="kills">Kills</option>
    <option value="graves_taken">Souls</option>
    <option value="diamonds_earned">Diamonds</option>
    <option value="health_given">Healer</option>
  </select>
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Player</th>
        <th class="accounting">Wins</th>
        <th class="accounting">Kills</th>
        <th class="accounting">Souls</th>
        <th class="accounting">Diamonds</th>
        <th class="accounting">Healer</th>
      </tr>
    </thead>
    <tr each={ stat, i in stats } class={ user.getCurrentUserClass(stat.github_login) }>
      <td>{ i + 1 }</td>
      <td>{ stat.github_login }</td>
      <td class="accounting">{ stat.games_won }</td>
      <td class="accounting">{ stat.kills }</td>
      <td class="accounting">{ stat.graves_taken }</td>
      <td class="accounting">{ stat.diamonds_earned }</td>
      <td class="accounting">{ stat.health_given }</td>
    </tr>
  </table>
  <script>
    let tag = this;

    /**
     * Updates the tag so any user-specific UI elements can be displayed.
     */
    user.on('login', function () {
      tag.update();
    });

    onCategoryChange () {
      updateStats();
    }

    function updateStats () {
      let category = tag.isMounted ? tag.refs.statCategory.value : 'games_won';

      $.getJSON(`/api/leaderboard/lifetime/${category}`, function (data) {
        tag.stats = data.stats;
        tag.update();
      });
    }

    tag.on('before-mount', updateStats);

  </script>
</leaderboard>