var request = require('request');
var fs = require('fs');
var unirest = require('unirest');
var Q = require('q');
var Game = require('./Game.js');
var game = new Game(5)
var gameDataRequest = {};
gameDataRequest.postGameDataToContainer = function(url, gameObj, next) {
    var Request = unirest.post(url).headers({ 'Accept': 'application/json' }).send(gameObj).end(function (response) {
      next(response.body);
    });
};

module.exports = gameDataRequest;
