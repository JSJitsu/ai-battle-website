<account>
  <h2>My Account</h2>
  <section if={ enabled === true }>
    <p>
      You are signed up for the next JavaScript Battle. We will pull your code from the GitHub repository listed below, which you may change at any time (we will pull your most up-to-date code from your GitHub account before each battle).
      <ul>
        <li>Note #1: If you have not already forked our hero-starter repository, <a href="https://github.com/JSJitsu/hero-starter" target="_blank">click here</a> and click "Fork" in the top right. If you don't do this, we won't be able to find your hero code, so your hero will just stand still for the entire battle!</li>
        <li>Note #2: If you want to change your hero code (your hero's "brain"), check out the hero-starter instructions.</li>
      </ul>
    </p>
    <form method="POST" action="/api/user" onsubmit={ saveSettings } ref="settings">
      <label for="github-repo">GitHub Repository <span class="tip">(default: hero-starter)</span></label>
      <input type="text" id="github-repo" name="code_repo" value={ code_repo } required>
      <label for="github-branch">GitHub Branch/Ref <span class="tip">(default: master)</span></label>
      <input type="text" id="github-branch" name="code_branch" value={ code_branch } required>
      <button type="submit" ref="submit">Save</button>
    </form>
    <p>
      Disabling your account will prevent your hero from partaking in battle. It can be re-enabled at any time.
    </p>
    <form method="POST" action="/api/user" onsubmit={ freezeAccount }>
      <input type="hidden" name="enabled" value="false">
      <button type="submit">Disable Account</button>
    </form>
  </section>
  <section if={ enabled === false }>
    <p>
      Your account is currently disabled. Your information will remain intact, and your hero will avoid battle until it has been restored.

      <p if={ disable_reason }>Reason: { disable_reason }</p>
    </p>
    <form method="POST" action="/api/user" onsubmit={ thawAccount }>
      <input type="hidden" name="enabled" value="true">
      <button type="submit">Enable Account</button>
    </form>
  </section>
  <h2>Statistics</h2>
  <section>
    <h3>Recent</h3>
    <table>
      <thead>
        <tr>
          <th>Result</th>
          <th>Survived</th>
          <th class="accounting">Kills</th>
          <th class="accounting">Damage Dealt</th>
          <th class="accounting">Mines Captured</th>
          <th class="accounting">Diamonds Earned</th>
          <th class="accounting">Health Recovered</th>
          <th class="accounting">Souls Absorbed</th>
        </tr>
      </thead>
      <tr>
        <td>{ recent.winner ? 'Victory' : 'Defeat' }</td>
        <td>{ recent.dead ? 'No' : 'Yes' }</td>
        <td class="accounting">{ recent.kills }</td>
        <td class="accounting">{ recent.damageGiven }</td>
        <td class="accounting">{ recent.minesTaken }</td>
        <td class="accounting">{ recent.diamondsEarned }</td>
        <td class="accounting">{ recent.healthRecovered }</td>
        <td class="accounting">{ recent.gravesTaken }</td>
      </tr>
    </table>
    <h3>Average <span class="tip">({ average.gamesPlayed } Games)</span></h3>
    <table>
      <thead>
        <tr>
          <th class="accounting">Kills</th>
          <th class="accounting">Kill/Death Ratio</th>
          <th class="accounting">Damage Dealt</th>
          <th class="accounting">Mines Captured</th>
          <th class="accounting">Diamonds Earned</th>
          <th class="accounting">Health Recovered</th>
          <th class="accounting">Souls Absorbed</th>
        </tr>
      </thead>
      <tr>
        <td class="accounting">{ average.kills }</td>
        <td class="accounting">{ average.kdRatio }</td>
        <td class="accounting">{ average.damageGiven }</td>
        <td class="accounting">{ average.minesTaken }</td>
        <td class="accounting">{ average.diamondsEarned }</td>
        <td class="accounting">{ average.healthRecovered }</td>
        <td class="accounting">{ average.gravesTaken }</td>
      </tr>
    </table>
    <h3>Lifetime <span class="tip">({ average.gamesPlayed } Games)</span></h3>
    <table>
      <thead>
        <tr>
          <th class="accounting">Kills</th>
          <th class="accounting">Deaths</th>
          <th class="accounting">Damage Dealt</th>
          <th class="accounting">Mines Captured</th>
          <th class="accounting">Diamonds Earned</th>
          <th class="accounting">Health Recovered</th>
          <th class="accounting">Souls Absorbed</th>
          <th class="accounting">Victories</th>
          <th class="accounting">Defeats</th>
        </tr>
      </thead>
      <tr>
        <td class="accounting">{ lifetime.kills }</td>
        <td class="accounting">{ lifetime.deaths }</td>
        <td class="accounting">{ lifetime.damage_given }</td>
        <td class="accounting">{ lifetime.mines_taken }</td>
        <td class="accounting">{ lifetime.diamonds_earned }</td>
        <td class="accounting">{ lifetime.health_recovered }</td>
        <td class="accounting">{ lifetime.graves_taken }</td>
        <td class="accounting">{ lifetime.games_won }</td>
        <td class="accounting">{ lifetime.games_lost }</td>
      </tr>
    </table>
    <h2>All Games</h2>
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th class="accounting">Turns</th>
          <th>Result</th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tr each={ game, i in games }>
        <td>{ (new Date(game.played_at)).toDateString() }</td>
        <td class="accounting">{ game.total_turns }</td>
        <td>{ game.winner ? 'Victory' : 'Defeat' }</td>
        <td width="130"><a href="/#game/{ game.id }">View Battle</a></td>
      </tr>
    </table>
  </section>
  <script>
    let tag = this;

    tag.recent = {};
    tag.average = {};
    tag.lifetime = {};
    tag.games = [];

    opts.user.on('login', function (data) {
      $.extend(tag, data);
      tag.fetchStats(data.github_login);
      tag.fetchGames(data.github_login);
      tag.update();
    });

    tag.fetchStats = function (username) {
      $.getJSON('/api/users/' + username + '/stats', function (data) {
        $.extend(tag, data);
        tag.update();
      });
    };

    tag.fetchGames = function (username) {
      $.getJSON('/api/users/' + username + '/games', function (data) {
        tag.games = data;
        tag.update();
      });
    };

    tag.saveSettings = function (event) {
      return tag.handleSubmitForm(event, 'Saving...');
    }

    tag.thawAccount = function (event) {
      return tag.handleSubmitForm(event, 'Thawing...');
    }

    tag.freezeAccount = function (event) {
      return tag.handleSubmitForm(event, 'Freezing...');
    }

    tag.handleSubmitForm = function (event, savingText) {
      event.preventDefault();

      let $form = $(event.target);
      let $button = $form.find('button[type="submit"]');
      let buttonText = $button.text();
      let values = $form.serialize();
      let action = $form.attr('action');

      $button
        .attr('disabled', true)
        .text(savingText);

      $.post(action, values, function (response, status) {
        if (response.github_login) {
          $.extend(tag, response);

          setTimeout(function () {
            $button.text('Saved!');
            tag.update();

            setTimeout(function () {
              $button
                .blur()
                .removeAttr('disabled')
                .text(buttonText);
            }, 1000);
          }, 1000);
        } else {
          $button.text('An error occurred');

          setTimeout(function () {
            $button
              .blur()
              .removeAttr('disabled')
              .text(buttonText);
          }, 1000);
        }
      });
    }
  </script>
</account>