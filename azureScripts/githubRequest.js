var request = require('./node_modules/request');
var MongoClient = require('./node_modules/mongodb').MongoClient;
var Q = require('./node_modules/q');
var fs = require('fs');
var key = require('./keys.js');
var mongoConnectionURL = key.key;

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
      results.forEach(function(val, ind) {
        console.log('RESULTS: ', results);
        console.log('LOOPING', ind);
        var currentUser = val;
        var options = {
          url: 'https://bizarroForrest:' + key.forrestPass + '@api.github.com/repos/' + currentUser.githubHandle + 
          '/' + currentUser.codeRepo + '/contents/hero.js',
          headers: {
            'User-Agent': 'hero-starter'
          }
        };
        request(options, function (error, response, body) {
          console.log('WTF???: ', ind);
          // if (error){console.log(error)};
          if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            var buffer = new Buffer(info.content, 'base64');
            var usersCode = buffer.toString('utf8');
            var regEx = usersCode.match(/\bdocker\b/gi);
            if (regEx){
              console.log("Possible Malicious Code.");
            }
            fs.writeFile('/Users/forrestbthomas/Documents/longproject/javascript-battle-webworkers/azureScripts/UsersCode/' + currentUser.githubHandle + '_hero.js', usersCode, function(err){
              // console.log(err);
            });
          }
        });
      });
    });
  });
};
usersCodeRequest();