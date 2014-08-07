var request = require('request');
var fs = require('fs');
var unirest = require('unirest');
var Game = require('./Game.js');
var game = new Game(5)
var gameDataRequest = {};
gameDataRequest.postGameDataToContainer = function(url, gameObj){
  
    unirest.post(url)
    .headers({ 'Accept': 'application/json' })
    .send(gameObj)
    .end(function (response) {
      return response.body;
    });
};

// gameDataRequest.postGameDataToContainer('http://localhost:8080/', game);


module.exports = gameDataRequest;
