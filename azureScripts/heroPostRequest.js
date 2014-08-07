var request = require('request');
var fs = require('fs');
var postFileToServer = function(url, heroFilePath){
	var r = request.post(url, function() {
    console.log('it is done');
	});

	var form = r.form();
	form.append('my_file', fs.createReadStream(heroFilePath));
};

postFileToServer('http://localhost:8080/heroFilesHere', './hero/myHero.js');
//spin up all the containers, save the port numbers for each
//we should now know which heroes are in which containers

//use the above fxn to post the brains to all containers

//Now all the containers are running a brain.

//OK--start the game.

