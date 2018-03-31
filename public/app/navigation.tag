<navigation>
  <nav class="h-nav">
    <a class="navigation-title" href="/"><h1 class="title">JavaScript Fight Club</h1></a>
    <ul class="navigation-list float-right">
      <li class="navigation-item"><a class="navigation-link" href="/#battle">Battle</a></li>
      <li class="navigation-item"><a class="navigation-link" href="/#leaderboard">Leaderboard</a></li>
      <li class="navigation-item"><a class="navigation-link" href="/#instructions">How to Play</a></li>
      <li class="navigation-item" if={ !loggedIn }><a class="navigation-link" href="/auth/github">Log in with GitHub</a></li>
      <virtual if={ loggedIn }>
        <li class="navigation-item"><a class="navigation-link" href="/account">{ username }</a></li>
        <li class="navigation-item"><a class="navigation-link" href="/logout">Log out</a></li>
      </virtual>
    </ul>
  </nav>
  <script>
    let tag = this;

    opts.user.on('login', function (data) {
      tag.loggedIn = !!data.github_id;
      tag.username = data.github_login;
      tag.update();
    });
  </script>
</navigation>