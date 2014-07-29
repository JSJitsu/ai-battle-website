var express = require('express');
var app = express();

var port = process.env.port || 8080;

// serve up files in public folder
app.use('/', express.static(__dirname + '/public'));

app.listen(port);
console.log('Listening on port: ', port);