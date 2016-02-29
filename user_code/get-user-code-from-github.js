var request = require('request');
var Q = require('q');
var fs = require('fs');
var path = require('path');
var secrets = require('../secrets.js');
var db = require('../database/connect.js');

function initiateCodeRequest (fileType) {
  db.query("SELECT * FROM player", function(err, users) {
    if (err) {
      throw err;
    }

    db.end();

    if (!users.length) {
      console.log('No users were found in the database, so user code could not be retrieved from Github.');
    } else {
      /**
       * @todo Get hero and helper code for a single user at the same time rather than getting
       * all of the hero code and then all of the helper code.
       */
      retrieveCode(users, 'hero');
      retrieveCode(users, 'helpers');
    }

  });
}

function retrieveCode (users, category) {
  users.forEach(function(user) {

    var githubHandle = user.github_login,
        codeRepo = user.code_repo;

    if (!githubHandle || !codeRepo) {
      console.log('Skipping bad user record:', user);
      return;
    }

    var options = {
      //Saves the URL at which the code can be found
      url: 'https://api.github.com/repos/' + githubHandle +
        '/' + codeRepo + '/contents/' + category +'.js' +
        '?client_id=' + secrets.appKey + '&client_secret=' + secrets.appSecret,
      headers: {
        'User-Agent': secrets.appName
      }
    };

    console.log(options.url);

    //Sends the request for each user's hero.js and helper.js file to the github API
    request(options, function (error, response, body) {
      console.log('Saving code for: ' + githubHandle);
      if (error){
        console.log('Error sending request!');
        console.log(error);
        return;
      }

      //If everything is ok, save the file
      if (response.statusCode == 200) {
        //Get response as JSON
        var info = JSON.parse(body);

        //Set up buffer to write file
        var buffer = new Buffer(info.content, 'base64');

        //Convert buffer to long string
        var usersCode = buffer.toString('utf8');

        //Check for "docker" anywhere in the file
        var regEx = usersCode.match(/\bdocker\b/gi);
        if (regEx){
          console.log("Possible Malicious Code.");
          return;
        }

        var filePath = path.resolve(
          secrets.rootDirectory,
          'user_code',
          category,
          githubHandle + '_' + category + '.js'
        );

        //Write the file to a predefined folder and file name
        fs.writeFile(filePath, usersCode, function(err) {
          if (err) {
            console.log('Error writing file: ' + category + '!');
            console.log(err);
          } else {
            console.log('Hero code saved: ' + category + '!');
          }
        });
      } else {
        /**
         * @todo Detect 404 responses and have the ability to prune dead accounts after a certain
         * number of failures.
         */
        console.log('Unexpected response code:' + response.statusCode + '!');
        console.log(body);
      }
    });
  });
}


initiateCodeRequest();