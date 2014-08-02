var mongodb = require('mongodb');
var Q = require('q');

var server = new mongodb.Server('localhost', 27017, {});
var db = new mongodb.Db('javascriptBattle', server);

Q.ninvoke(db, 'open').then(function(result) {
  console.log('database opened, creating collection');
  return Q.ninvoke(db, 'createCollection', 'gameData');
}).then(function(collection) {
  var gameObject = { 
    asdf: {
      asdgasg: {hi:'there'}
    },
    arr: [],
    str: 'yo!'
  };
  return Q.ninvoke(collection, 'insert', gameObject);
}).then(function(docs) {
  console.log(docs);
  db.close();
}).catch(function(err) {
  console.log(err);
});