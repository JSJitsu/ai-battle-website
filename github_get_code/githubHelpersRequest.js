var request = require('../node_modules/request');
var MongoClient = require('../node_modules/mongodb').MongoClient;
var Q = require('../node_modules/q');
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
var usersHelperCodeRequest = function () {

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
          //Saves the URL at which the hero code can be found
          url: 'https://' + secrets.apiUser + ':' + secrets.apiPass + '@api.github.com/repos/' + user.githubHandle + 
          '/' + user.codeRepo + 'contents/helpers.js',

          //Needed by the github API
          headers: {
            'User-Agent': secrets.apiUser
          }
        };

        console.log(options.url);

        //Sends the request for each user's helpers.js file to the github API
        request(options, function (error, response, body) {
          console.log('Saving helper code for: ' + user.githubHandle);
          if (error){
            console.log('Error sending request!');
            console.log(error)
            return;
          };
          console.log(response.statusCode);
          console.log(secrets.rootDirectory + '/user_code/' + user.githubHandle + '_helpers.js')
          //If everything is ok, save the file
          if (response.statusCode == 200) {
            console.log('Good repsonse');
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

            //Write the file to a predefined folder and file name
            fs.writeFile(secrets.rootDirectory + '/user_code/' + user.githubHandle + '_helpers.js', usersCode, function(err) {
              if (err) {
                console.log('Error writing file!');
                console.log(err);
              } else {
                console.log('Helper code saved!');
              }
            });
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
usersHelperCodeRequest();