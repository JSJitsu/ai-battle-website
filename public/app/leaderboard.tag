<leaderboard>
  <h2>Leaderboard</h2>
  <select name="time" onchange={ onCategoryChange } ref="statTime">
    <option value="lifetime">Overall</option>
    <option value="today">Today</option>
  </select>
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
        <th>Wins</th>
        <th>Kills</th>
        <th>Souls</th>
        <th>Diamonds</th>
        <th>Healer</th>
      </tr>
    </thead>
    <tr each={ stat, i in stats }>
      <td>{ i + 1 }</td>
      <td>{ stat.github_login }</td>
      <td>{ stat.games_won }</td>
      <td>{ stat.kills }</td>
      <td>{ stat.graves_taken }</td>
      <td>{ stat.diamonds_earned }</td>
      <td>{ stat.health_given }</td>
    </tr>
  </table>

  <script>
    let tag = this;

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