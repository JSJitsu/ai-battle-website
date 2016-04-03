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

  app.put('/userInfo', bodyParser.json(), urlEncodedBodyParser, function(req, res) {

    var newUserParams = req.body;
    if (newUserParams.codeRepo) {
      req.user.codeRepo = newUserParams.codeRepo;

      var record = req.user;
      var updateSql = dbHelper.updateSql('player', record);

      return Q.ninvoke(db, 'query', updateSql, record).then(function (results) {
        return results[0];
      })
      .done(
        function(user) {
          res.json(user);
        },
        function(err) {
          res.send('An error occurred...are you logged in?');
        }
      );
    } else {
      res.send('user.codeRepo must be truthy in order to update.');
    }

  });

  //Convert the user object from github into something smaller that
  //can be stored in a cookie
  passport.serializeUser(function(githubData, done) {
    // console.log('recieved data from github:', githubData);

    //Check if user exists
    console.warn(`SELECT * FROM player WHERE github_login = '${githubData.username}'`);
    Q.ninvoke(db, 'query', `SELECT * FROM player WHERE github_login = '${githubData.username}'`).then(function(users) {

      var user = users[0];

      //If user does exist, pass user to next "then" statmement
      if (user) {
        console.log('returning user', user);
        return user;

      //If user does not exist, create and save new user,
      //then pass user to next "then" (or done) statement
      } else {
        var record = {
          github_login: githubData.username,
          github_id: githubData.id
        };

        var insertSql = dbHelper.insertSql('player', record, 'github_login');

        console.warn(insertSql);

        return Q.ninvoke(db, 'query', insertSql, record).then(function (results) {
          console.log('returning new user', results[0]);
          return results[0];
        });
      }

    }).then(
      function(user) {
        //The done here is different than the one above--this one
        //is from passport, and lets passport know we're "done"
        //serializing the user
        done(null, user.github_login);
      },
      function(err) {
        console.log('SERIALIZE ERROR!');
        console.log(err);
      }
    );

  });

  //Convert the hero id stored in the cookie into the user object
  //in our database
  passport.deserializeUser(function(githubHandle, done) {
    Q.ninvoke(db, 'query', `SELECT * FROM player WHERE github_login = '${githubHandle}'`)
    .done(
      function(users) {
        console.warn('found the following users', users);
        var user = users[0];
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
