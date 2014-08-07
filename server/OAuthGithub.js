var GitHubStrategy = require('passport-github').Strategy;
var passport = require('passport');
var express = require('express');
var session = require('express-session');
var mongoose = require('mongoose');
var Q = require('q');

mongoose.connect('mongodb://localhost/javascriptBattle');

var userSchema = mongoose.Schema({
  githubHandle: String,
  codeRepo: {
    type: String,
    default: ''
  }
});

var User = mongoose.model('User', userSchema);

module.exports = function(app) {

  app.use(session({ secret: 'thisisasecret'}));
  app.use(passport.initialize());
  app.use(passport.session());

  //Convert the user object from github into something smaller that
  //can be stored in a cookie
  passport.serializeUser(function(githubUser, done) {
    //Check if user exists
    Q.ninvoke(User, 'find', {
      githubHandle: githubUser.username
    }).then(function(user) {
      //No user found, need to create one
      if (user.length === 0) {
        //Create new user object
        var user = new User({
          githubHandle: githubUser.username
        });

        //Save user (return the promise of saving the user)
        return Q.ninvoke(user, 'save');

      //This user already exists, return it
      } else {
        return user[0];
      }
    }).then(function(user) {
      done(null, user._id);
    }).catch(function(err) {
      console.log(err);
    });
  });

  //Convert the hero id stored in the cookie into the user object
  //in our database
  passport.deserializeUser(function(mongoId, done) {
    //continue with the user with the matching Id
    Q.ninvoke(User, 'findById', mongoId).then(function(user) {
      done(null, user);
    }).catch(function(err) {
      res.send(err);
    });
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

  //Go here to login
  app.get('/auth/github',passport.authenticate('github'));

  //Go here to log out
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  //This is where github sends us after it finishes authenticating us
  app.get('/auth/github/callback', passport.authenticate('github', { 
    successRedirect: '/success',
    failureRedirect: '/error'
  }));

  app.get('/success', function(req, res, next) {
    res.send('Successfully logged in.');
  });
   
  app.get('/error', function(req, res, next) {
    res.send("Error logging in.");
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