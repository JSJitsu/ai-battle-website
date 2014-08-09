var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var mongoConnectionURL = process.env.CUSTOMCONNSTR_MONGO_URI;
var Q = require('q');
var fs = require('fs');

var openGameDatabase = function() {
  return Q.ninvoke(MongoClient, 'connect', mongoConnectionURL).then(function(db) {
    console.log('open!');
    return {
      collection: db.collection('users')
    };
  });
};

var usersCodeRequest = function () {
  var openDatabasePromise = openGameDatabase();
  openDatabasePromise.then(function(data){
    data.collection.find().toArray(function(err, results){
      for (var i = 0; i < results.length; i++){
        console.log('LOOPING');
        var currentUser = results[i];
        var options = {
          url: 'https://api.github.com/repos/' + currentUser.githubHandle + 
          '/' + currentUser.codeRepo + '/contents/hero.js',
          headers: {
            'User-Agent': 'hero-starter'
          }
        };
        var callback = function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            var buffer = new Buffer(info.content, 'base64');
            var usersCode = buffer.toString('utf8');
            console.log(usersCode);
            var regEx = usersCode.match(/\bdocker\b/gi);
            if (regEx){
              console.log("Possible Malicious Code.");
            }
            fs.writeFile('./UsersCode/' + currentUser.githubHandle + '_hero.js', usersCode, function(err){
              console.log(err);
            });
          } 
        };
        request(options, callback);
      }
    });
  })
};
usersCodeRequest(); 