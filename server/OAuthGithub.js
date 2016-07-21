var GitHubStrategy = require('passport-github2').Strategy;
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var Q = require('q');

module.exports = function(app, db, dbHelper, options) {

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'ilovejavascriptbattle',
      resave: false,
      saveUninitialized: true
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  //Makes the current user's info available
  app.get('/userInfo', function(req, res) {
    res.json(req.user);
  });

  //Make the current user's code repository updatable
  var urlEncodedBodyParser = bodyParser.urlencoded({
    extended: false
  });

  app.post('/userInfo', bodyParser.json(), urlEncodedBodyParser, function(req, res) {

    var newUserParams = req.body;

    if (!req.user) {
      res.status(401).end();
      return;
    }

    if (newUserParams.code_repo) {
      req.user.code_repo = newUserParams.code_repo;

      var record = req.user;
      var updateSql = dbHelper.updateSql('player', record, `github_login = '${record.github_login}'`);

      return Q.ninvoke(db, 'query', updateSql, record).catch(function (error) {
        console.error(error);
        res.status(500).end();
      })
      .done(function () {
        res.send(record);
      });
    } else {
      res.send('user.code_repo must be truthy in order to update.');
    }

  });

  //Convert the user object from github into something smaller that
  //can be stored in a cookie
  passport.serializeUser(function(githubData, done) {
    //Check if user exists
    Q.ninvoke(db, 'query', `SELECT * FROM player WHERE github_login = '${githubData.username}'`).then(function(users) {

      var user = users[0];

      if (user) {
        return user;
      } else {
        // Create a new user if we couldn't find one
        var record = {
          github_login: githubData.username,
          github_id: githubData.id,
          avatar_url: githubData.avatar_url,
          joined_at: new Date()
        };

        var insertSql = dbHelper.insertSql('player', record, 'github_login');

        return Q.ninvoke(db, 'query', insertSql, record).then(function (results) {
          return results[0];
        });
      }

    }).then(
      function(user) {
        done(null, user.github_login);
      },
      function(err) {
        console.log('SERIALIZE ERROR!');
        console.log(err);
      }
    );

  });

  passport.deserializeUser(function(githubHandle, done) {
    Q.ninvoke(db, 'query', `SELECT * FROM player WHERE github_login = '${githubHandle}'`).then(function (users) {

      var user = users[0];

      return Q.ninvoke(db, 'query', `SELECT * FROM player_lifetime_stats WHERE github_login = '${githubHandle}'`).then(function (stats) {
        if (stats[0]) {
          user.lifetime_stats = stats[0];
        }

        return user;
      });
    })
    .done(
      function(user) {
        done(null, user);
      },
      function(err) {
        console.log(err);
      }
    );
  });

  var clientId = options.github.clientId || process.env.GITHUB_CLIENT_ID;
  var clientSecret = options.github.clientSecret || process.env.GITHUB_CLIENT_SECRET;

  var callbackURL = options.github.callbackUrl || process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/auth/github/callback';

  var strategy = new GitHubStrategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: callbackURL
  }, function(accessToken, refreshToken, profile, done) {
    done(null, profile);
  });

  passport.use('github', strategy);

  //Go here to login
  app.get('/auth/github',passport.authenticate('github'));

  //Go here to log out
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  //This is where github sends us after it finishes authenticating us
  app.get('/auth/github/callback', passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/'
  }));

};
