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
      .headers({ 'Accepts': 'application/json' })
      .set('Content-Type', 'application/json')
      .timeout(maxWaitTime)
      .send(JSON.stringify(gameData)).end(function(response) {
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
            deferred.resolve('File sent successfully!');
          }
        });

        //Append the file so it gets posted
        var form = r.form();
        form.append(fileType, fs.createReadStream(filePath));

      } else {
        deferred.resolve('No file found...file not transferred!');
      }
    });
  }

  //Return the promise
  return deferred.promise;
};

//Returns a promise that resolves to true if the container is ready
//Rejects if the container takes too long to get ready
communicateWithContainersObj.checkIfContainerIsReady = function(port) {
  var deferred = Q.defer();

  var maxAttempts = 90;
  var msDelay = 1000;
  var attempts = 0;

  var url = 'http://localhost:' + port;
  var fakeForm = {
    form: {
      key: 'value'
    }
  };


  var pingContainer = function() {
    attempts++;
    if (attempts >= maxAttempts) {
      deferred.reject('Container at port ' + port + ' not ready after ' + maxAttempts + ' attempts!')
    } else {
      request.post(url, fakeForm, function(err, response, body) {
        if (err || body !== '"Not yet loaded"') {
          console.log('Container at port ' + port + ' is not yet ready...trying again');

          //Keeps looping until the container is ready
          setTimeout(pingContainer, msDelay); 
        } else {
          deferred.resolve(true);        
        }
      });
    }
  };

  pingContainer();

  return deferred.promise;
  
};

module.exports = communicateWithContainersObj;
