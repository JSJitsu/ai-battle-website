<account>
  <h2>My Account</h2>
  <section>
  <p>
    You are signed up for the next JavaScript Battle. We will pull your code from the GitHub repository listed below, which you may change at any time (we will pull your most up-to-date code from your GitHub account before each battle).
    <ul>
      <li>Note #1: If you have not already forked our hero-starter repository, <a href="https://github.com/JSJitsu/hero-starter" target="_blank">click here</a> and click "Fork" in the top right. If you don't do this, we won't be able to find your hero code, so your hero will just stand still for the entire battle!</li>
      <li>Note #2: If you want to change your hero code (your hero's "brain"), check out the hero-starter instructions.</li>
    </ul>
  </p>
  <form>
    <label for="github-repo">GitHub Repository <span class="tip">(default: hero-starter)</span></label>
    <input type="text" id="github-repo" name="code_repo" required>
    <label for="github-branch">GitHub Branch/Ref <span class="tip">(default: master)</span></label>
    <input type="text" id="github-branch" name="code_branch" required>
    <button type="submit">Save</button>
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
        <td>Second</td>
        <td>Yes</td>
        <td class="accounting">3</td>
        <td class="accounting">220</td>
        <td class="accounting">4</td>
        <td class="accounting">350</td>
        <td class="accounting">260</td>
        <td class="accounting">1</td>
      </tr>
    </table>
    <h3>Lifetime</h3>
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
          <th class="accounting">Wins</th>
          <th class="accounting">Losses</th>
        </tr>
      </thead>
      <tr>
        <td class="accounting">3</td>
        <td class="accounting">220</td>
        <td class="accounting">4</td>
        <td class="accounting">350</td>
        <td class="accounting">260</td>
        <td class="accounting">1</td>
        <td class="accounting">3</td>
        <td class="accounting">220</td>
        <td class="accounting">4</td>
      </tr>
    </table>
    <h3>Average (422 Games)</h3>
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
        <td class="accounting">3</td>
        <td class="accounting">220</td>
        <td class="accounting">4</td>
        <td class="accounting">350</td>
        <td class="accounting">260</td>
        <td class="accounting">1</td>
        <td class="accounting">3</td>
      </tr>
    </table>
  </section>
  <script>
    let tag = this;
  </script>
</account>