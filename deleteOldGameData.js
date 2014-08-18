var MongoClient = require('mongodb').MongoClient;
var secrets = require('./secrets.js');
var mongoConnectionURL = secrets.mongoKey;
var Q = require('q');

// get current date string to compare to dates in database
var getDateString = function() {
  var d = new Date();
  var result = (d.getMonth() + 1).toString();
  result += '/' + d.getDate();
  result += '/' + d.getFullYear();
  return result;
};

var currentDateString = getDateString();

// returns a promise that resolves when the database opens
var openGameDatabase = function() {
  return Q.ninvoke(MongoClient, 'connect', mongoConnectionURL).then(function(db) {
    console.log('open!');
    return {
      db: db,
      gameDataCollection: db.collection('jsBattleGameData')
    };
  });
};

// delete all game data information with date strings less than current
module.exports = function() {

  // opens connection to mongo database
  var openDatabasePromise = openGameDatabase();

  // access the open database promise
  openDatabasePromise.then(function(mongoData) {
    var gameDataCollection = mongoData.gameDataCollection;
    var db = mongoData.db;
      
      // remove all data with date less than current
      gameDataCollection.remove({date: { $lt: currentDateString}}, function(err, removed) {
        // error handling
        if (err) {
          console.log('err: ', err);
        }
        console.log('number removed: ', removed);
        // close the database
        db.close();
        console.log('closed the collection');
      });
  });
};

module.exports();

