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
  this.maxRetries = 50;
  this.msBetweenRetries = 400;

  // A promise:
  // Resolves when we are connected (or re-connected) to the DB
  // Rejects if database connection failed
  // Gets overwritten as new connection attempts are made
  this.connectionPromise = Q.fapply(function() {
    throw err('Connection never established!');
  });

  // A flag indicating whether we are in the process of (re-) connecting
  // to the DB
  this.connecting = false;
};

// Used for the inital connection
SafeMongoConnection.prototype.connect = function() {
  this.connecting = true;
  this.connectionPromise = this._reconnect();
  return this.connectionPromise;
};

// Attempts to connect to the database (with certain # of retries)
SafeMongoConnection.prototype._reconnect = function() {
  var attemptToConnect = function(attemptsRemaining) {
    return Q.ninvoke(MongoClient, 'connect', this.connectionURL, this.connectionOptions)

    .then(function(db) {
      console.log('Database connected!', new Date());
      this.connecting = false;
      this.db = db;
      return db;

    }.bind(this))

    .fail(function(err) {
      console.log('*****');            
      console.log('Error connecting to database:', new Date());
      console.log(err);
      console.log('*****');

      if (attemptsRemaining > 1) {
        attemptsRemaining--;
        console.log('Will attempt to reconnect in ' + this.msBetweenRetries +
                    ' milliseconds (' + attemptsRemaining +
                    ' attempt(s) remaining)...', new Date());
        return Q.delay(this.msBetweenRetries)
        .then(function() {
          return attemptToConnect(attemptsRemaining);
        });
      } else {
        console.log('Unable to connect to database.', new Date());
        this.connecting = false;
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
    .then(function() {
      this.db = undefined;
      return true;
    });
  } else {
    console.log('DB was never connected, no need to disconnect.', new Date());
    // Written this way b/c we always want to return a promise here
    return Q.fapply(function() { return true; });
  }
};

// Make sure database is still connected
// If it is not connected, attempt to reconnect
// Always returns a promise
SafeMongoConnection.prototype._confirmConnection = function() {
  var handleDownedConnection = function() {
    if (this.connecting) {
      console.log('Connection is down, already in the process of reconnecting...', new Date());

      // After connection attempt finishes, this will either have the new (working) DB connection,
      // or it will have been rejected (leading to an eventual error on a .fail or .done statement)
      return this.connectionPromise;
    } else {
      console.log('Connection went down!  Attempting to reconnect...', new Date());

      // Update the connection status and connection promise:
      this.connecting = true;
      // Disconnect first
      this.connectionPromise = this.disconnect()
      // Then try to reconnect
      .then(function() {
        return this._reconnect();
      }.bind(this));


      return this.connectionPromise;
    }
  }.bind(this);

  // Make sure the connection is defined
  if (this.db) {

    // Ping the mongo server to make sure connection is up
    return Q.ninvoke(this.db, 'command', { ping: 1 })
    
    .timeout(5000).then(function(pingResult) {
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
    console.log('No connection found!  Attempting to reconnect...', new Date());
    // Update the connection status and connection promise:
    this.connecting = true;
    this.connectionPromise = this.disconnect().then(function() {
      return this._reconnect();
    }.bind(this));

    return this.connectionPromise;
  }
};

// Used to safely run arbitrary mongo commands on the database
// Accepts the name of the collection, the name of the method,
// and then an arbitrary number of arguments to pass to the method
SafeMongoConnection.prototype.safeInvoke = function(collectionName, methodName) {
  var args = Array.prototype.slice.call(arguments, 2);

  // Confirms connection beforehand
  return this._confirmConnection()

  // Once database connection is confirmed, runs the function
  .then(function() {
    return Q.npost(this.db.collection(collectionName), methodName, args);
  }.bind(this));
};

module.exports = SafeMongoConnection;