var GitHubStrategy = require('passport-github').Strategy;
var passport = require('passport');
var express = require('express');
var session = require('express-session');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/javascriptBattle');

var userSchema = mongoose.Schema({
  id: String,
  githubHandle: String,
  codeRepo: String
});

var User = mongoose.model('User', userSchema);

module.exports = function(app) {

  app.use(session({ secret: 'thisisasecret'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(function(req, res, next) {
    console.log(req.user);
    next();
  });

  passport.serializeUser(function(user, done) {
    //Check if user exists
    

    // console.log('user in serializeUser: ', user);
    done(null, user.id);
  });

  passport.deserializeUser(function(obj, done) {
    // console.log('obj in deserializeUser: ', obj);
    done(null, obj);
  });
  
  var GITHUB_CLIENT_ID = 'd0d7cc13b38c11adb842';
  var GITHUB_CLIENT_SECRET = '9c43f6883b19bc6c32c064f848209df5dc8fba17';

  var strategy = new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/auth/github/callback'
  }, function(accessToken, refreshToken, profile, done) {
    console.log('got here!');
    done(null, profile);
  });

  passport.use('github', strategy);
  
  // github oath integration with passport
  var GITHUB_CLIENT_ID = 'd0d7cc13b38c11adb842';
  var GITHUB_CLIENT_SECRET = 'f745c3ff8e2718cf4f0debabd8d0abbcace5b91f';

  app.get('/auth/github',passport.authenticate('github'));

  app.get('/success', function(req, res, next) {
    res.send('Successfully logged in.');
  });
   
  app.get('/error', function(req, res, next) {
    res.send("Error logging in.");
  });

  app.get('/auth/github/callback', passport.authenticate('github', { 
      successRedirect: '/success',
      failureRedirect: '/error'
    }));

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.send('you done fucked up now!');
    }
  };

  app.get('/restricted', ensureAuthenticated, function(req, res) {
    res.send('you are IN!');
  });


};