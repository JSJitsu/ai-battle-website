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
      db: db
      users: db.collection('users'),
    };
  });
};


//Saves all user data
var usersCodeRequest = function () {

  //Opens connection to mongo database
  var openDatabasePromise = openGameDatabase();

  openDatabasePromise.then(function(mongoDataObject) {
    var userCollection = mongoDataObject.users;

    //Gets all users in the database
    userCollection.find().toArray(function(err, users) {
      //Loops through all users
      results.forEach(function(currentUser, ind) {

        var options = {
          //Saves the URL at which the hero code can be found
          url: 'https:/' + secrets.apiUser + ':' + secrets.apiPass + '@api.github.com/repos/' + currentUser.githubHandle + 
          '/' + currentUser.codeRepo + '/contents/hero.js',

          //Needed by the github API
          headers: {
            'User-Agent': secrets.apiUser
          }
        };

        //Sends the request for each user's hero.js file to the github API
        request(options, function (error, response, body) {
          console.log('Saving hero code for: ' + currentUser.githubHandle);
          if (error){
            console.log('ERROR!');
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

            //Write the file to a predefined folder and file name
            fs.writeFile(secrets.userCodeFolder + currentUser.githubHandle + '_hero.js', usersCode, function(err) {
              console.log('ERROR!');
              console.log(err);
              return;
            });
            
            console.log('Hero code saved!');
          }
        });
      });
    });
  });
};

//Kick off the whole process
usersCodeRequest();