var request = require('request');
var fs = require('fs');
var Q = require('q');

var postToServerFunctions = {};

//Posts the given file to the given port (at localhost)
//Returns a promise
postToServerFunctions.postFile = function(port, filePath, fileType) {
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

module.exports = postToServerFunctions;
