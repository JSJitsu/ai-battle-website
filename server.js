var express = require('express');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var Q = require('q');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var port = process.env.port || 8080;

//Defines mongo connection for azure deploy (or, failing that, for local deploy)
var mongoConnectionURL = process.env.CUSTOMCONNSTR_MONGOLAB_URI || 'mongodb://localhost/javascriptBattle';

var getDateString = function() {
  var d = new Date();
  var result = (d.getMonth() + 1).toString();
  result += '/' + d.getDate();
  result += '/' + d.getFullYear();
  return result;
};

//Deployment
//Connect to mongo
var openMongoCollection = Q.ninvoke(MongoClient, 'connect', mongoConnectionURL).then(function(db) {
  console.log('open!');
  return db.collection('jsBattleGameData');
});

// serve up files in public folder
app.use('/', express.static(__dirname + '/public'));

// if ( !process.env.mode ) {
app.use('/tests', express.static(__dirname + '/test'));
// }

 // UNCOMMENT FOR LOCAL TESTING
var router = express.Router();
router.get('/debug', function(req, res) {
  res.send(mongoConnectionURL);
});

router.get('/gameData/:turn', function(req, res){
  openMongoCollection.then(function(collection) {
    collection.find({
      '_id':req.params.turn + '|' + getDateString()
    }).toArray(function(err,results) {
      if (err) {
        res.send(err);
      }
      res.send(results[0]);
    });
  }).catch(function(err) {
    //If something goes wrong, respond with error
    res.send(err);
  });
});

// set root route for app's data
app.use('/api', router);


// github oath integration with passport
var GITHUB_CLIENT_ID = process.env.clientID || 'local no id';
var GITHUB_CLIENT_SECRET = process.env.clientSecret || 'local no id';

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: 'http://www.javascriptbattle.com/'
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// app.get('/', function(req, res){
//   res.render('index', { user: req.user });
// });

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('./index.html');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

app.listen(port);
console.log('Listening on port: ', port);

// for ServerSpec.js to work must export app
module.exports = app;