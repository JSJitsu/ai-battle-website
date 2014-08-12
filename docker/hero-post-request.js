var request = require('request');
var fs = require('fs');

var postFileToServer = function(port, filePath){
  var url = 'http://0.0.0.0:' + port;
	var r = request.post(url, function(err, res, body) {
    console.log(res.body);
	});

	var form = r.form();
	form.append('my_file', fs.createReadStream(filePath));
};

module.exports = postFileToServer;
