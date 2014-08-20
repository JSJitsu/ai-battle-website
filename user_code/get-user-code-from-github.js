var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var fs = require('fs');
var secrets = require('../secrets.js');
var mongoConnectionURL = secrets.mongoKey;

//Returns a promise that resolves when the database opens
var openGameDatabase = function() {
  return Q.ninvoke(MongoClient, 'connect', mongoConnectionURL).then(function(db) {
    console.log('open!');
    return {
      db: db,
      userCollection: db.collection('users')
    };
  });
};

//Saves all user data
var usersCodeRequest = function(fileType) {

  if (fileType !== 'hero' & fileType !== 'helpers') {
    throw new Error('Invalid file type!  Must be either "hero" or "helpers"!');
  }

  //Opens connection to mongo database
  var openDatabasePromise = openGameDatabase();

  openDatabasePromise.then(function(mongoDataObject) {
    var userCollection = mongoDataObject.userCollection;
    var db = mongoDataObject.db;

    //Gets all users in the database
    userCollection.find().toArray(function(err, users) {
      if (err) {
        console.log('Error finding users!');
        console.log(err);
        db.close();
        return;
      }

      //Loops through all users
      users.forEach(function(user, ind) {

        var options = {
          //Saves the URL at which the code can be found
          url: 'https://' + secrets.apiUser + ':' + secrets.apiPass + '@api.github.com/repos/' + user.githubHandle + 
          '/' + user.codeRepo + '/contents/' + fileType +'.js',

          //Needed by the github API
          headers: {
            'User-Agent': secrets.apiUser
          }
        };

        console.log(options.url);

        //Sends the request for each user's hero.js and helper.js file to the github API
        request(options, function (error, response, body) {
          console.log('Saving code for: ' + user.githubHandle);
          if (error){
            console.log('Error sending request!');
            console.log(error)
            return;
          };

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

            var filePath = secrets.rootDirectory + '/user_code/' + fileType 
                + '/' + user.githubHandle + '_' + fileType + '.js';
            console.log(filePath);


            //Write the file to a predefined folder and file name
            fs.writeFile(filePath, usersCode, function(err) {
              if (err) {
                console.log('Error writing file: ' + fileType + '!');
                console.log(err);
              } else {
                console.log('Hero code saved: ' + fileType + '!');
              }
            });
          } else {
            console.log('Unexpected response code:' + response.statusCode + '!');
          }
        });

        //Close the database connection when everything is finished
        db.close();

      });
    });
  }).catch(function(err) {
    console.log('Error opening database!');
    console.log(err);
  });
};

//Kick off the whole process
usersCodeRequest('hero');
usersCodeRequest('helpers');
