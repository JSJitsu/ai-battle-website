var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
Q.longStackSupport = true;

// Created to handle the frequent disconnects of our mongo replica set
// (necessary regardless b/c every database is bound to have issues once
//  in a while, though ours seems to have more than most)
var SafeMongoConnection = function(connectionURL, connectionOptions) {
  this.db = undefined;
  this.connectionURL = connectionURL;
  this.connectionOptions = connectionOptions;
  this.maxRetries = 10;
  this.msBetweenRetries = 1000;
};

// Attempts to connect to the database (with certain # of retries)
SafeMongoConnection.prototype.connect = function() {
  
  var attemptToConnect = function(attemptsRemaining) {
    return Q.ninvoke(MongoClient, 'connect', this.connectionURL, this.connectionOptions)

    .then(function(db) {
      console.log('Database connected!');
      this.db = db;

      return db;
    }.bind(this))

    .fail(function(err) {
      console.log('*****');            
      console.log('Error connecting to database:');
      console.log(err);
      console.log('*****');

      if (attemptsRemaining > 1) {
        attemptsRemaining--;
        console.log('Will attempt to reconnect in ' + this.msBetweenRetries +
                    ' milliseconds (' + attemptsRemaining +
                    ' attempt(s) remaining)...');
        return Q.delay(this.msBetweenRetries)
        .then(function() {
          return attemptToConnect(attemptsRemaining);
        });
      } else {
        console.log('Unable to connect to database.');
        throw(err);
      }
    }.bind(this));

  }.bind(this);

  return attemptToConnect(this.maxRetries);

};

// Disconnects from the database (if applicable)
// Always returns a promise
SafeMongoConnection.prototype.disconnect = function() {
  if (this.db) {
    return Q.ninvoke(this.db, 'close')
  } else {
    console.log('DB was never connected, no need to disconnect.')
    return Q.fapply(function() {});
  }
};

// Make sure database is still connected
// If it is not connect, attempt to reconnect
// Always returns a promise
SafeMongoConnection.prototype.confirmConnection = function() {
  var handleDownedConnection = function() {
    console.log('Connection went down!  Attempting to reconnect...');

    // Disconnect first
    return this.disconnect()

    // Then try to reconnect
    .then(function() {
      return this.connect();
    }.bind(this));

  }.bind(this);

  // Make sure the connection is defined
  if (this.db) {

    // Ping the mongo server to make sure connection is up
    return Q.ninvoke(this.db, 'command', { ping: 1 })
    
    .then(function(pingResult) {
      // If the connection is up, return the database
      if (pingResult) {
        return this.db;

      // If not, attempt to reconnect
      } else {
        return handleDownedConnection();
      }
    }.bind(this))

    // If not, attempt to reconnect
    .fail(function(err) {
      return handleDownedConnection();
    });

  } else {
    console.log('No connection found!  Attempting to reconnect...');
    return this.connect();
  }
};

// Used to safely run arbitrary mongo commands on the database
// Accepts the name of the collection, the name of the method,
// and then an arbitrary number of arguments to pass to the method
SafeMongoConnection.prototype.safeInvoke = function(collectionName, methodName) {
  args = Array.prototype.slice.call(arguments, 2);

  // Confirms connection beforehand
  return this.confirmConnection()

  // If database is still connected, runs the function
  .then(function() {
    return Q.npost(this.db.collection(collectionName), methodName, args);
  }.bind(this));
};

module.exports = SafeMongoConnection;