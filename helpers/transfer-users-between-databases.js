var Q = require('q');
var openMongoDatabase = require('../helpers/open-mongo-database.js');

//Overwrites all users in the "to" database with the users in the "from" database
var transferUsersBetweenDatabases = function(fromConnectionUrl, toConnectionUrl) {
  openMongoDatabase(fromConnectionUrl).then(function(mongoDataFrom) {
    console.log('Getting users from the first database...');

    //Get all users from the "from" database
    return Q.ninvoke(mongoDataFrom.userCollection, 'find').then(function(response) {
      return Q.ninvoke(response, 'toArray');

    //Close the "from" database connection.then(function(usersFrom) {
    }).then(function(usersFrom) {

      //Return the array of users
      return Q.ninvoke(mongoDataFrom.db, 'close').then(function() {
        console.log('Users have been stored in memory, closing the first database and opening the second...')
        return usersFrom;
      });
    });
  //Insert the "from" users into the "to" database
  }).then(function(usersFrom) {
    //Open the "to" database
    return openMongoDatabase(toConnectionUrl).then(function(mongoDataTo) {
      //Delete all existing users
      return Q.ninvoke(mongoDataTo.userCollection, 'remove').then(function() {
        //Put all the users from the first database into this one
        return Q.ninvoke(mongoDataTo.userCollection, 'insert', usersFrom)
      }).then(function() {
        return mongoDataTo.db;
      });
    });

  }).then(function(dbTo) {
    console.log('Transfer successful!');
    console.log('Closing the second database...');
    dbTo.close();
  }).catch(function(err) {
    console.log('Something went wrong!');
    console.dir(err);
  });
};
// transferUsersBetweenDatabases('mongodb://localhost/javascriptBattle', 'mongodb://localhost/javascriptBattle2');
module.exports = transferUsersBetweenDatabases;