var GitHubStrategy = require('passport-github').Strategy;
var passport = require('passport');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');


module.exports = function(app, safeMongoConnection) {
  //Creates mongoose User model connected to the mongo URL
  var User = require('./User');

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
      safeMongoConnection.safeInvoke(
        'users',
        'update',
        {
          _id: req.user._id
        },
        req.user,
        {}
      )
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
  passport.serializeUser(function(githubUser, done) {
    var githubHandle = githubUser.username;

    //Check if user exists
    safeMongoConnection.safeInvoke('users', 'findOne', {
      githubHandle: githubHandle
    }).then(function(user) {

      //If user does exist, pass user to next "then" statmement
      if (user) {
        return user;

      //If user does not exist, create and save new user,
      //then pass user to next "then" (or done) statement
      } else {
        user = new User(githubHandle);
        return safeMongoConnection.safeInvoke('users', 'insert', user)
        .then(function(userArr) {
          return userArr[0];
        });
      }

    }).done(
      function(user) {
        //The done here is different than the one above--this one
        //is from passport, and lets passport know we're "done"
        //serializing the user
        done(null, user.githubHandle);
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
    safeMongoConnection.safeInvoke('users', 'findOne', { githubHandle: githubHandle })
    .done(
      function(user) {
        done(null, user);
      },
      function(err) {
        console.log(err);
      }
    );
  });
  
  var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  var callbackURL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/auth/github/callback';

  var strategy = new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
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
