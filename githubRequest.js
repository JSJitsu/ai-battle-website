var request = require('request');
var options = {
    url: 'https://api.github.com/repos/' + githubUsername + '/hero-starter/contents/hero.js',
    headers: {
        'User-Agent': 'hero-starter'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        console.log(info.content)
        var buffer = new Buffer(info.content, 'base64');
        var usersCode = buffer.toString('utf8');
        return usersCode;
    }
}

request(options, callback);