var secrets = require('../../secrets.js');
var spawn = require('child-process-promise').spawn;
var exec = require('child-process-promise').exec;

var startStopContainersObj = {};

//Start a container at the specified port
//Returns a promise
startStopContainersObj.spinUpContainer = function(port) {
  return spawn(secrets.rootDirectory + 
      '/docker/container_interaction/start-hero-brain-container.sh', [port])

  .progress(function(childProcess) {
    console.log('[spawn] childProcess.pid: ', childProcess.pid);
    childProcess.stdout.on('data', function(data) {
        console.log('  [spawn] stdout: ', data.toString());
    });
    childProcess.stderr.on('data', function(data) {
        console.log('  [spawn] stderr: ', data.toString()); 
    });
  });
    
};

//Return a promise that resolves after stopping all containers,
//then removing all containers
startStopContainersObj.shutDownAllContainers = function() {
  return exec('sudo docker stop $(sudo docker ps -q -a)')

  .progress(function(childProcess) {
    console.log('[spawn] childProcess.pid: ', childProcess.pid);
    childProcess.stdout.on('data', function(data) {
        console.log('  [spawn] stdout: ', data.toString());
    });
    childProcess.stderr.on('data', function(data) {
        console.log('  [spawn] stderr: ', data.toString()); 
    });
  })

  .then(function() {
    return exec('sudo docker rm -f $(sudo docker ps -a -q)')

    .progress(function(childProcess) {
      console.log('[spawn] childProcess.pid: ', childProcess.pid);
      childProcess.stdout.on('data', function(data) {
          console.log('  [spawn] stdout: ', data.toString());
      });
      childProcess.stderr.on('data', function(data) {
          console.log('  [spawn] stderr: ', data.toString()); 
      });
    });
    
  });
};

module.exports = startStopContainersObj;