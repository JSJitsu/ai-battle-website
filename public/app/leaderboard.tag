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

    .leaderboard__hero {
      border-bottom: 0.1rem solid #1f2933;
    }

    .hero-stats {
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

    .hero-stats__item {
      padding: 1.2rem 1.5rem;
    }

    .hero-stats__rank {
      grid-area: ra;
    }

    .hero-stats__rank-value {
      grid-area: rv;
    }

    .hero-stats__login {
      grid-area: la;
    }

    .hero-stats__login-value {
      grid-area: lv;
      word-break: break-all;
    }

    .hero-stats__wins {
      grid-area: wa;
    }

    .hero-stats__wins-value {
      grid-area: wv;
    }

    .hero-stats__kills {
      grid-area: ka;
    }

    .hero-stats__kills-value {
      grid-area: kv;
    }

    .hero-stats__souls {
      grid-area: sa;
    }

    .hero-stats__souls-value {
      grid-area: sv;
    }

    .hero-stats__diamonds {
      grid-area: da;
    }

    .hero-stats__diamonds-value {
      grid-area: dv;
    }

    .hero-stats__healed {
      grid-area: ha;
    }

    .hero-stats__healed-value {
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
    <div each={ stat, i in stats } class="leaderboard__hero  hero-stats  { user.getCurrentUserClass(stat.github_login) }">
      <div class="hero-stats__item  hero-stats__attribute  hero-stats__rank">Rank</div>
      <div class="hero-stats__item  hero-stats__rank-value">{ i + 1 }</div>
      <div class="hero-stats__item  hero-stats__attribute  hero-stats__login">Player</div>
      <div class="hero-stats__item  hero-stats__login-value">{ stat.github_login }</div>
      <div class="hero-stats__item  hero-stats__attribute  hero-stats__wins">Wins</div>
      <div class="hero-stats__item  hero-stats__wins-value  accounting">{ stat.games_won }</div>
      <div class="hero-stats__item  hero-stats__attribute  hero-stats__kills">Kills</div>
      <div class="hero-stats__item  hero-stats__kills-value  accounting">{ stat.kills }</div>
      <div class="hero-stats__item  hero-stats__attribute  hero-stats__souls">Souls</div>
      <div class="hero-stats__item  hero-stats__souls-value  accounting">{ stat.graves_taken }</div>
      <div class="hero-stats__item  hero-stats__attribute  hero-stats__diamonds">Diamonds</div>
      <div class="hero-stats__item  hero-stats__diamonds-value  accounting">{ stat.diamonds_earned }</div>
      <div class="hero-stats__item  hero-stats__attribute  hero-stats__healed">Healer</div>
      <div class="hero-stats__item  hero-stats__healed-value  accounting">{ stat.health_given }</div>
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
        tag.stats = data.stats;
        tag.update();
      });
    }

    tag.on('before-mount', updateStats);

  </script>
</leaderboard>
