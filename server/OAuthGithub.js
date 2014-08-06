var GitHubStrategy = require('passport-github').Strategy;
var passport = require('passport');


module.exports = function(app) {

  // github oath integration with passport
  var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'local no id';
  var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'local no id';


// app.configure(function() {
//   app.use(passport.initialize());
//   app.use(express.session({ secret: 'keyboard cat' }));
//   app.use(passport.session());
// });

passport.use('github', new GitHubStrategy({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/"
  },
  function(accessToken, refreshToken, profile, done) {
      // find or create user in database and return user not entire profile to 'done'
      // User.findOrCreate(..., function(err, user) {
      // done(err, user);
      console.log('accessToken in passport.use callback: ', accessToken);
      console.log('refreshToken in passport.use callback: ', refreshToken);
      console.log('profile in passport.use callback: ', profile);
      return done(null, profile);
      //});
  }
));


passport.serializeUser(function(user, done) {
  console.log('user in serializeUser: ', user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('id in deserializeUser: ', id);
  // find user by id in db and return user
  // done(null, user);
  done(null, id);
});

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { successRedirect: '/', failureRedirect: '/login' }));
};