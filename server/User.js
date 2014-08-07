var mongoose = require('mongoose');

module.exports = function(mongoConnectionUrl) {
  mongoose.connect(mongoConnectionUrl);

  var UserSchema = mongoose.Schema({
    githubHandle: String,
    codeRepo: {
      type: String,
      default: ''
    }
  });

  //Returns the user model
  return mongoose.model('User', UserSchema);
};