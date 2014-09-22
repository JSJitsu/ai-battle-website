// A wrapper around the mongo connection object
// It's main purpose is to simply return the
// open database connection.

// However, it will also refresh this connection
// if the connection has been open for a minimum
// number of seconds.

// The reason for this is that since switching to
// the Azure mongo replica set, we've started getting
// timeouts when the connection is stale (and the
// keepAlive & auto_reconnect flags don't seem to 
// entirely fix the issue)

var Q = require('q');
var Mongo = require('mongodb');
var MongoClient = Mongo.MongoClient;

//Constructor
var JsBattleConnection = function(mongoConnectionUrl, secondsBetweenRefresh) {
  this.mongoConnectionUrl = mongoConnectionUrl;
  this.mongoConnectionOptions = {
    server: {
      socketOptions: {
        keepAlive: 1000
      },
      auto_reconnect: true
    }
  };

  this.lastConnectionTimestamp = undefined;
  this.db = undefined;
  this.secondsBetweenRefresh = secondsBetweenRefresh;

  this.connectionPromise = this.openConnection();
};

// Closes the connection and returns a promise
JsBattleConnection.prototype.closeConnection = function() {
  return Q.ninvoke(this.db, 'close').then(function() {
    console.log('Connection Closed!');
  }.bind(this));
};

JsBattleConnection.prototype.openConnection = function() {
  return Q.ninvoke(MongoClient, 'connect', this.mongoConnectionUrl, this.mongoConnectionOptions).then(function(db) {
    console.log('Connection Opened!');

    //Save connection object and the time it was opened
    this.db = db;
    this.lastConnectionTimestamp = new Date();

    //Not strictly needed for this implementation, but good to return the result of the connect
    //query in the promise itself
    return db;
  }.bind(this));
};

JsBattleConnection.prototype.refreshConnection = function() {
  return this.closeConnection().then(function() {
    return this.openConnection();
  }.bind(this));
};

// Creates a connection to the mongo server if one
// doesn't exist or if the connection is old.
// Otherwise, returns the existing connection.
// Always returns a promise
JsBattleConnection.prototype.getConnection = function() {
  // We do this outer promise layer b/c we want to always return a promise,
  // regardless of whether we are returning the current connection,
  // or a promise to a connection that is getting refreshed.
  return this.connectionPromise.then(function() {

    // If too long has elapsed, refreshes the connection
    var currentTime = new Date();
    // The "* 1000" is necessary because timestamps are stored in ms
    if (this.lastConnectionTimestamp <= currentTime - this.secondsBetweenRefresh * 1000) {
      console.log('Connection is stale! Refreshing connection...');
      return this.refreshConnection().then(function() {
        return this.db;
      });
    // Otherwise simply return the current connection
    } else {
      return this.db;
    }
  }.bind(this));
};

module.exports = JsBattleConnection;

// jsbc = new JsBattleConnection(5);

// jsbc.getConnection().then(function(db) {
//   console.log('Connection 0!');
//   console.log(jsbc.lastConnectionTimestamp);
//   setTimeout(function() {
//     jsbc.getConnection().then(function() {
//       console.log('Connection 2!');
//       console.log(jsbc.lastConnectionTimestamp);
//       jsbc.getConnection().then(function() {
//         console.log('Connection 3!');
//       });
//     });
//   },8000);
// });

// setTimeout(function() {
//   jsbc.getConnection().then(function() {
//     console.log('Connection 1!');
//     console.log(jsbc.lastConnectionTimestamp);
//   });
// },500);
