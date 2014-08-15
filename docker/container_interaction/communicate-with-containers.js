var request = require('request');
var fs = require('fs');
var Q = require('q');
var unirest = require('unirest');

var communicateWithContainersObj = {};

communicateWithContainersObj.postGameData = function(port, gameData) {
  var deferred = Q.defer();

  //The URL to post the file
  var url = 'http://0.0.0.0:' + port.toString();

  //Milliseconds before turn is skipped
  var maxWaitTime = 5000;

  //Make the request
  var Request = unirest.post(url)
      .headers({ 'Accept': 'application/json' })
      .timeout(maxWaitTime)
      .send(gameData).end(function(response) {
    deferred.resolve(response.body);
  });

  //Return a promise
  return deferred.promise;
};

//Posts the given file to the given port (at localhost)
//Returns a promise
communicateWithContainersObj.postFile = function(port, filePath, fileType) {
  var deferred = Q.defer();

  //Make sure fileType is valid
  if (fileType !== 'hero' && fileType !== 'helper') {
    deferred.reject(new Error('Invalid file type! Must be either "helper" or "hero"'));
  } else {
    //Check whether file path exists, reject promise if not
    fs.exists(filePath, function(exists) {
      if (exists) {

        //The URL to post the file
        var url = 'http://0.0.0.0:' + port.toString() + '/' + fileType + 'FilesHere';

        //Post the file to the given port
        var r = request.post(url, function(error, response) {
          if (error) {
            deferred.reject(new Error(error));
          } else {
            deferred.resolve(response.body);
          }
        });

        //Append the file so it gets posted
        var form = r.form();
        form.append(fileType, fs.createReadStream(filePath));

      } else {
        deferred.resolve('No file found...file not transferred');
        // deferred.reject(new Error('"' + filePath + '" does not exist!'));
      }
    });
  }

  //Return the promise
  return deferred.promise;
};

module.exports = communicateWithContainersObj;
