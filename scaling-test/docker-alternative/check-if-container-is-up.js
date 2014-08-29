var request = require('request');
var Q = require('q');

var checkIfContainerIsUp = function(port) {
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
        if (err) {
          deferred.reject(err);
        } else {
          if (body === '"Not yet loaded"') {
            deferred.resolve(true);        
          } else {
            console.log('Container at port ' + port + ' is not yet ready...trying again');

            //Keeps looping until the container is ready
            process.setTimeout(pingContainer, msDelay); 
          }
        }
      });
    }
  };

  pingContainer();

  return deferred.promise;
  
};

module.exports = checkIfContainerIsUp;

checkIfContainerIsUp(12510).then(function(isReady) {
  console.log(isReady);
}).catch(function(err) {
  console.log('ERROR!');
  console.log(err);
})