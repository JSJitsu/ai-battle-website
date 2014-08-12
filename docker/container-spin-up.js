var secrets = require('../secrets.js');
var spawn = require('child-process-promise').spawn;

var spinUpContainer = function(port) {
  return spawn(secrets.rootDirectory + '/docker/start-hero-brain-container.sh',[port])
    .progress(function(childProcess) {
      console.log('[spawn] childProcess.pid: ', childProcess.pid);
      childProcess.stdout.on('data', function(data) {
          console.log('[spawn] stdout: ', data.toString());
      });
      childProcess.stderr.on('data', function(data) {
          console.log('[spawn] stderr: ', data.toString()); 
      });
    });
};

// spinUpContainer(15551).then(function() {
//   return spinUpContainer(123);
// }).then(function() {
//   return spinUpContainer(51231);
// });

module.exports = spinUpContainer;