<leaderboard>
  <style>

    .leaderboard {
      display: none;
      flex-direction: column;
    }

    @media screen and (max-width: 600px) {
      .leaderboard-table {
        display: none;
      }

      .leaderboard {
        display: flex;
      }
    }

    .hero-stats {
      border-bottom: 0.1rem solid #1f2933;
      display: grid;
      grid-template-columns: repeat(4, auto);
      grid-template-rows: repeat(5, auto);
      grid-template-areas:
        "ra rv wa wv"
        "la la ka kv"
        "lv lv sa sv"
        "lv lv da dv"
        "lv lv ha hv";
    }

    .hero-stats > div {
      padding: 1.2rem 1.5rem;
    }

    .stat-rank {
      grid-area: ra;
    }

    .stat-rank-value {
      grid-area: rv;
    }

    .stat-login {
      grid-area: la;
    }

    .stat-login-value {
      grid-area: lv;
      word-break: break-all;
    }

    .stat-wins {
      grid-area: wa;
    }

    .stat-wins-value {
      grid-area: wv;
    }

    .stat-kills {
      grid-area: ka;
    }

    .stat-kills-value {
      grid-area: kv;
    }

    .stat-souls {
      grid-area: sa;
    }

    .stat-souls-value {
      grid-area: sv;
    }

    .stat-diamonds {
      grid-area: da;
    }

    .stat-diamonds-value {
      grid-area: dv;
    }

    .stat-healed {
      grid-area: ha;
    }

    .stat-healed-value {
      grid-area: hv;
    }

  </style>

  <h2>Leaderboard</h2>
  <label for="leaderboard-category">sorted by</label>
  <select id="leaderboard-category" name="category" onchange={ onCategoryChange } ref="statCategory">
    <option value="games_won">Wins</option>
    <option value="kills">Kills</option>
    <option value="graves_taken">Souls</option>
    <option value="diamonds_earned">Diamonds</option>
    <option value="health_given">Healer</option>
  </select>
  <table class="leaderboard-table">
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
  <div class="leaderboard">
    <div each={ stat, i in stats } class="hero-stats { user.getCurrentUserClass(stat.github_login) }">
      <div class="stat-rank bold">Rank</div>
      <div class="stat-rank-value">{ i + 1 }</div>
      <div class="stat-login bold">Player</div>
      <div class="stat-login-value">{ stat.github_login }</div>
      <div class="stat-wins bold">Wins</div>
      <div class="stat-wins-value accounting">{ stat.games_won }</div>
      <div class="stat-kills bold">Kills</div>
      <div class="stat-kills-value accounting">{ stat.kills }</div>
      <div class="stat-souls bold">Souls</div>
      <div class="stat-souls-value accounting">{ stat.graves_taken }</div>
      <div class="stat-diamonds bold">Diamonds</div>
      <div class="stat-diamonds-value accounting">{ stat.diamonds_earned }</div>
      <div class="stat-healed bold">Healer</div>
      <div class="stat-healed-value accounting">{ stat.health_given }</div>
    </div>
  </div>

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
        const intlNumber = new Intl.NumberFormat();
        tag.stats = data.stats.map(stat => {
          stat.games_won = intlNumber.format(stat.games_won);
          stat.kills = intlNumber.format(stat.kills);
          stat.graves_taken = intlNumber.format(stat.graves_taken);
          stat.diamonds_earned = intlNumber.format(stat.diamonds_earned);
          stat.health_given = intlNumber.format(stat.health_given);

          return stat;
        });

        tag.update();
      });
    }

    tag.on('before-mount', updateStats);

  </script>
</leaderboard>
