var request = require('request');
var fs = require('fs');
var Q = require('q');

var postToServerFunctions = {};

//Posts the given file to the given port (at localhost)
//Returns a promise
postToServerFunctions.postFile = function(port, fileType, heroFilePath) {
  var deferred = Q.defer();

  var url = 'http://localhost:' + port.toString() + '/' + fileType + 'FilesHere';

  if (fileType !== 'hero' && fileType !== 'helper') {
    deferred.reject(new Error('Invalid file type! Must be either "helper" or "hero"'));

  } else {
    var r = request.post(url, function(err, res) {
      console.log(res.body);
      if (err) {
        deferred.reject(new Error(err));
      } else {
        deferred.resolve(res.body);
      }
    });

    var form = r.form();
    form.append('my_file', fs.createReadStream(heroFilePath));
  }

  return deferred.promise;
};

postToServerFunctions.postFile(8080, 'hero', '/home/greg/hack-reactor/javascript-battle/workers/helpers.js').then(function(val) {
  console.log('---');
  console.log(val);
});

module.exports = postToServerFunctions;

// postFileToServer('http://localhost:8080/heroFilesHere', '/home/greg/hack-reactor/javascript-battle/workers/helpers.js').then(function(val) {
//   console.log('---');
//   console.log(val);
// });