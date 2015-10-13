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
        mostRecentGameId: '',
        codeRepo: 'hero-starter',
        codeRepoBranch: 'master',
        lifetimeStats: {
          kills: 0,
          deaths: 0,
          damageDealt: 0,
          minesCaptured: 0,
          diamondsEarned: 0,
          healthRecovered: 0,
          healthGiven: 0,
          gravesRobbed: 0,
          wins: 0,
          losses: 0
        },
        mostRecentStats: {
          gameResult: 'N/A',
          survived: false,
          kills: 0,
          damageDealt: 0,
          minesCaptured: 0,
          diamondsEarned: 0,
          healthRecovered: 0,
          healthGiven: 0,
          gravesRobbed: 0
        }
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

addFakeUsers(4);