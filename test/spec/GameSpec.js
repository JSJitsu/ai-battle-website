/* global projects, describe, it, expect, should */
var expect = require('chai').expect;
var Board = require('../../Board.js');
var DiamondMine = require('../../DiamondMine.js');
var Game = require('../../Game.js');
var HealthWell = require('../../HealthWell.js');
var Hero = require('../../Hero.js');
var Impassable = require('../../Impassable.js');
var Unoccupied = require('../../Unoccupied.js');

describe('Game dependencies exist.', function () {
  'use strict';

  beforeEach(function() {
 

  });

  it('Board.js exists', function () {
    var board = new Board(5);
    expect(board).to.be.a('object');
  });
  it('DiamondMine.js exists', function () {
    var diamondMine = new DiamondMine(0,0);
    expect(diamondMine).to.be.a('object');
  });
  it('Game.js exists', function () {
    var game = new Game();
    expect(game).to.be.a('object');
  });
  it('HealthWell.js exists', function () {
    var healthWell = new HealthWell(0,0);
    expect(healthWell).to.be.a('object');
  });
  it('Hero.js exists', function () {
    var hero = new Hero(0,0);
    expect(hero).to.be.a('object');
  });
  it('Impassable.js exists', function () {
    var impassable = new Impassable(0,0);
    expect(impassable).to.be.a('object');
  });
  it('Unoccupied.js exists', function () {
    var unoccupied = new Unoccupied(0,0);
    expect(unoccupied).to.be.a('object');
  });


});

describe('Board object.', function() {

  it('Should have a tiles property.', function() {
    var board = new Board(5);
    expect(board.tiles).to.be.a('array');
  });
  
  it('Should have a length of side property.', function() {
    var board = new Board(5);
    expect(board.lengthOfSide).to.equal(5);
  });

  it('Should have an initialize board method.', function() {
    var board = new Board(5);
    expect(board.initializeBoard).to.be.a('function');
  });

  it('Should have an inspect method.', function() {
    var board = new Board(5);
    expect(board.inspect).to.be.a('function');
  });

  it('Should have a valid coordinates method.', function() {
    var board = new Board(5);
    expect(board.validCoordinates).to.be.a('function');
  });

  it('Should have a get tiles nearby method.', function() {
    var board = new Board(5);
    expect(board.getTileNearby).to.be.a('function');
  });

}); 

describe('Board methods.', function() {

  describe('Initialize board method.', function() {

    it('Initalize a board of a given length.', function() {
      var board = new Board(5);
      expect(board.lengthOfSide).to.equal(5);
    });
    it('Should handle negative lengths.', function() {
       var err = new ReferenceError('Instantiate board with a positive integer only.');
       var fn = function(){
         var board = new Board(-5);
       };
      expect(fn).to.throw('Instantiate board with a positive integer only.');
    });
    it('Should handle decimal lengths.', function() {
       var err = new ReferenceError('Instantiate board with a positive integer only.');
       var fn = function(){
         var board = new Board(1.5);
       };
      expect(fn).to.throw('Instantiate board with a positive integer only.');
    });
    it('Board tiles should initially be unoccupied.', function() {
      var board = new Board(2);
      for (var i = 0; i < board.tiles.length; i++) {
        for (var j = 0; j < board.tiles[i].length; j++) {
          expect(board.tiles[i][j].type).to.equal('Unoccupied');
        }
      }
    });
  });

  describe('ValidCoordinates board method.', function() {
    
    xit('Should take an X and Y coordinate.', function() {
      var fn = function() {
        var board = new Board(4);
        board.validCoordinates(5);
      };
      expect(fn).to.throw('Enter 2 parmeters (X,Y).');
    });

    it('Should return false if given invalid coordinates.', function() {
      var board = new Board(4);
      expect(board.validCoordinates(5,5)).to.equal(false);
    });

    it('Should return true if given valid coordinates.', function() {
      var board = new Board(4);
      expect(board.validCoordinates(3,3)).to.equal(true);
    });
  });

  describe('Get tile nearby board method.', function() {
    xit('Should take an X and Y coordinate.', function() {
      var fn = function() {
        var board = new Board(4);
        board.getTileNearby(5);
      };
      expect(fn).to.throw('Enter 2 parameters (X,Y).');
    });

    it('Should return a tile when given valid coordinates and direction (West).', function() {
      var board = new Board(4);
      var west = board.getTileNearby(0,3,'West');
      expect(!!west).to.equal(true);
    });

    it('Should return a tile when given valid coordinates and direction (South).', function() {
      var board = new Board(4);
      var south = board.getTileNearby(0,0,'South');
      expect(!!south).to.equal(true);
    });

    it('Should return a tile when given valid coordinates and direction (North).', function() {
      var board = new Board(4);
      var north = board.getTileNearby(3,0,'North');
      expect(!!north).to.equal(true);
    });

    it('Should return a tile when given valid coordinates and direction (East).', function() {
      var board = new Board(4);
      var east = board.getTileNearby(0,0,'East');
      expect(!!east).to.equal(true);
    });

    it('Should return a tile when given valid coordinates and direction (East).', function() {
      var board = new Board(4);
      var east = board.getTileNearby(0,3,'East');
      expect(east).to.equal(false);
    });

    it('Should return a tile when given valid coordinates and direction (North).', function() {
      var board = new Board(4);
      var north = board.getTileNearby(0,0,'North');
      expect(north).to.equal(false);
    });

    it('Should return a tile when given valid coordinates and direction (South).', function() {
      var board = new Board(4);
      var south = board.getTileNearby(3,3,'South');
      expect(south).to.equal(false);
    });

    it('Should return a tile when given valid coordinates and direction (West).', function() {
      var board = new Board(4);
      var west = board.getTileNearby(0,0,'West');
      expect(west).to.equal(false);
    });

  });


});