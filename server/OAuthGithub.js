var GitHubStrategy = require('passport-github').Strategy;
var passport = require('passport');
var express = require('express');
var session = require('express-session');


module.exports = function(app) {

  // github oath integration with passport
  var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'local no id';
  var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'local no id';

  var strategy = new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/auth/github/callback'
  });
  passport.use('github', strategy, function(accessToken, refreshToken, profile, done) {
    done(null, profile);
    process.nextTick(function() {
    });
  });

  // passport.use(new GitHubStrategy({
  //     clientID: GITHUB_CLIENT_ID,
  //     clientSecret: GITHUB_CLIENT_SECRET,
  //     callbackURL: "http://www.javascriptbattle.com/"
  //   },
  //   function(accessToken, refreshToken, profile, done) {
  //     console.log('accessToken in passport.use callback: ', accessToken);
  //     console.log('refreshToken in passport.use callback: ', refreshToken);
  //     console.log('profile in passport.use callback: ', profile);
  //     process.nextTick(function () {
  //       return done(null, profile);
  //     });
  //   }
  // ));

  passport.serializeUser(function(user, done) {
    console.log('user in serializeUser: ', user);
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    console.log('obj in deserializeUser: ', obj);
    done(null, obj);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/auth/github',
    passport.authenticate('github'),
    function(req, res) {
      //redirected to github for authentication
      //so code should never get here
    });

  app.get('/success', function(req, res, next) {
    res.send('Successfully logged in.');
  });
   
  app.get('/error', function(req, res, next) {
    res.send("Error logging in.");
  });

  app.get('/auth/github/callback', 
    passport.authenticate('github', { 
      successRedirect: 'http://localhost:8080/success',
      failureRedirect: 'http://localhost:8080/error'
    }));

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

};