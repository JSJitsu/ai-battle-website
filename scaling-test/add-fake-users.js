var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var fs = require('fs');
var secrets = require('../secrets.js');
var mongoConnectionURL = secrets.mongoKey;

//Make sure someone doesn't overwrite production database
secrets.mongoKey = 'mongodb://localhost/javascriptBattle';

//Returns a promise that resolves when the database opens
var openGameDatabase = function() {
  return Q.ninvoke(MongoClient, 'connect', mongoConnectionURL).then(function(db) {
    console.log('open!');
    return {
      db: db,
      userCollection: db.collection('users')
    };
  });
};

var addFakeUsers = function(numberOfFakeUsers) {

  //Opens connection to mongo database
  openGameDatabase().then(function(mongoDataObject) {
    var userCollection = mongoDataObject.userCollection;
    var db = mongoDataObject.db;

    var fakeUserPromises = [];
    for (var i=0; i<numberOfFakeUsers; i++) {
      fakeUserPromises[i] = Q.ninvoke(userCollection, 'insert', {
        githubHandle: 'fakeUser' + i,
        mostRecentGameNumber: undefined,
        port: undefined,
        codeRepo: 'hero-starter',
        codeRepoBranch: 'master'
      });
    }
    Q.all(fakeUserPromises).then(function() {
      console.log('Fake users added successfully!');
      db.close();
    }).catch(function(err) {
      console.log('Error adding fake users!');
      console.log(err);
      db.close();
    });
  }).catch(function(err) {
    console.log('Error opening database!');
    console.log(err);
  });

};

addFakeUsers(400);