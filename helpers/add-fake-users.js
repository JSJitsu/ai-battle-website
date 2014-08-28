var Q = require('q');
var openGameDatabase = require('../helpers/open-mongo-database.js');

//Returns a promise that resolves when the database opens
var addFakeUsers = function(numberOfFakeUsers) {

  //Opens connection to mongo database (only EVER add fake users to local test dbs)
  return openGameDatabase('mongodb://localhost/javascriptBattle').then(function(mongoDataObject) {
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
    return Q.all(fakeUserPromises).then(function() {
      console.log('Fake users added successfully!');
      db.close();
    }).catch(function(err) {
      console.log('Error adding fake users!');
      console.log(err);
      db.close();
    });
  });
};

addFakeUsers(200);