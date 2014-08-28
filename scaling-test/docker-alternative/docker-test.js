var Docker = require('dockerode');
// var docker = new Docker({socketPath: '/var/run/docker.sock'});
var docker = new Docker();

var handler = function(err, res) {
  console.log(res);
};

docker.createContainer({Image: 'hero_brain_wrapper'}, function(err, container) {
  if (err) {
    console.log('ERROR creating containers');
    console.log(err);
    return;
  }

  container.start({
    PortBindings: {
      '9999/tcp': [
        {
          'HostPort': '9999'
        }
      ]
    }
  }, function(err, data) {
    if (err) {
      console.log('ERROR starting containers');
      console.log(err);
      return;
    }
    console.log(data);
  });
});