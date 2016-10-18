var request = require('request');
var Q = require('q');
var fs = require('fs');
var path = require('path');
var secrets = require('../../secrets.js');
var db = require('../../database/connect.js');

function initiateCodeRequest (fileType) {

  console.log('About to retrieve user code from Github...');

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
      console.warn('Skipping bad user record:', user);
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

    //Sends the request for each user's hero.js and helper.js file to the github API
    request(options, function (error, response, body) {
      console.log(`Saving code for ${githubHandle} / ${category}`);

      if (error){
        console.warn('Error sending request!');
        console.warn(error);
        return;
      }

      //If everything is ok, save the file
      if (response.statusCode == 200) {
        //Get response as JSON
        var info = JSON.parse(body);

        if (info.size > 65536) {
          console.warn(`${githubHandle} script size of ${info.size} is larger than 64k`);
          return;
        }

        //Set up buffer to write file
        var buffer = new Buffer(info.content, 'base64');

        //Convert buffer to long string
        var usersCode = buffer.toString('utf8');

        var filePath = path.resolve(
          __dirname,
          category,
          githubHandle + '_' + category + '.js'
        );

        var directory = path.dirname(filePath);

        // See if our target directory exists and create it if it doesn't
        try {
          fs.statSync(directory);
        } catch (e) {
          console.log('Making directory', directory);
          fs.mkdirSync(directory);
        }

        //Write the file to a predefined folder and file name
        fs.writeFile(filePath, usersCode, function(err) {
          if (err) {
            console.error(`Error writing file: ${filePath}`);
            console.error(err);
          }
        });
      } else {
        /**
         * @todo Detect 404 responses and have the ability to prune dead accounts after a certain
         * number of failures.
         */
        console.warn('Unexpected response code:', response.statusCode, 'from', options.url, 'with message', body);
      }
    });
  });
}


initiateCodeRequest();