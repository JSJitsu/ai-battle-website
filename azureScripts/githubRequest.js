var request = require('request');
var fs = require('fs');
var options = {
  url: 'https://api.github.com/repos/forrestbthomas/hero-starter/contents/hero.js',
  headers: {
    'User-Agent': 'hero-starter'
  }
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    var buffer = new Buffer(info.content, 'base64');
    var usersCode = buffer.toString('utf8');
    console.log(usersCode);
    var regEx = usersCode.match(/\bdocker\b/gi);
    if (regEx){
      console.log("Possible Malicious Code.");
    }
    fs.writeFile('/Users/forrestbthomas/Documents/hero.js', usersCode, function(err){
      console.log(err);
    });
  }
}

request(options, callback);