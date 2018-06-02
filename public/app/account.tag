<account>
  <style>

    .statistics--recent {
      display: grid;
      grid-template-columns: repeat(8, auto);
      grid-template-rows: repeat(2, auto);
    }

    @media screen and (max-width: 812px) {
      .statistics--recent {
        grid-template-columns: repeat(2, auto);
        grid-template-rows: repeat(8, auto);
        grid-auto-flow: column;
        text-align: right;
      }
    }

    .statistics--average {
      display: grid;
      grid-template-columns: repeat(7, auto);
      grid-template-rows: repeat(2, auto);
    }

    @media screen and (max-width: 812px) {
      .statistics--average {
        grid-template-columns: repeat(2, auto);
        grid-template-rows: repeat(7, auto);
        grid-auto-flow: column;
      }
    }

    .statistics--lifetime {
      display: grid;
      grid-template-columns: repeat(9, auto);
      grid-template-rows: repeat(2, auto);
    }

    @media screen and (max-width: 900px) {
      .statistics--lifetime {
        grid-template-columns: repeat(2, auto);
        grid-template-rows: repeat(9, auto);
        grid-auto-flow: column;
      }
    }

  </style>

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
    <div class="statistics  statistics--recent">
      <div class="statistics__item  statistics__item--attribute">Result</div>
      <div class="statistics__item  statistics__item--attribute">Survived</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Kills</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Damage Dealt</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Mines Captured</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Diamonds Earned</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Health Recovered</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Souls Absorbed</div>

      <div class="statistics__item  statistics__item--value">{ recent.winner ? 'Victory' : 'Defeat' }</div>
      <div class="statistics__item  statistics__item--value">{ recent.dead ? 'No' : 'Yes' }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ recent.kills }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ recent.damageGiven }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ recent.minesTaken }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ recent.diamondsEarned }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ recent.healthRecovered }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ recent.gravesTaken }</div>
    </div>
    <h3>Average <span class="tip">({ average.gamesPlayed } Games)</span></h3>
    <div class="statistics  statistics--average">
      <div class="statistics__item  statistics__item--attribute  accounting">Kills</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Kill/Death Ratio</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Damage Dealt</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Mines Captured</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Diamonds Earned</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Health Recovered</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Souls Absorbed</div>

      <div class="statistics__item  statistics__item--value  accounting">{ average.kills }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ average.kdRatio }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ average.damageGiven }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ average.minesTaken }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ average.diamondsEarned }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ average.healthRecovered }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ average.gravesTaken }</div>
    </div>
    <h3>Lifetime <span class="tip">({ average.gamesPlayed } Games)</span></h3>
    <div class="statistics  statistics--lifetime">
      <div class="statistics__item  statistics__item--attribute  accounting">Kills</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Deaths</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Damage Dealt</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Mines Captured</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Diamonds Earned</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Health Recovered</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Souls Absorbed</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Victories</div>
      <div class="statistics__item  statistics__item--attribute  accounting">Defeats</div>

      <div class="statistics__item  statistics__item--value  accounting">{ lifetime.kills }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ lifetime.deaths }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ lifetime.damage_given }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ lifetime.mines_taken }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ lifetime.diamonds_earned }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ lifetime.health_recovered }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ lifetime.graves_taken }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ lifetime.games_won }</div>
      <div class="statistics__item  statistics__item--value  accounting">{ lifetime.games_lost }</div>
    </div>
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
