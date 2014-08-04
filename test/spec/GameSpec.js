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

describe('Board.js', function() {

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
    xit('Should handle negative lengths.', function() {
       var err = new ReferenceError('Instantiate board with a positive integer only.');
       var fn = function(){
         var board = new Board(-5);
       };
      expect(fn).to.throw('Instantiate board with a positive integer only.');
    });
    xit('Should handle decimal lengths.', function() {
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

  describe('DiamondMine.js', function() {
    it('Should make a DiamondMine object.', function(){
      var d = new DiamondMine(2,2);
      expect(d).to.be.a('object');
    });
    it('Should have no owner on instantiation.', function(){
      var d = new DiamondMine(2,2);
      expect(d.owner).to.equal(undefined);
    });
    it('Should have no id on instantiation.', function(){
      var d = new DiamondMine(2,2);
      expect(d.id).to.equal(undefined);
    });
  });

  describe('HealthWell.js', function() {
    it('Should make a HealthWell object.', function(){
      var hw = new HealthWell(2,2);
      expect(hw).to.be.a('object');
    });
    it('Should have the type "HealthWell".', function(){
      var hw = new HealthWell(2,2);
      expect(hw.type).to.equal('HealthWell');
    });
  });

  describe('Hero.js', function() {
    describe('Hero properties.', function(){
      it('Should have no mines and no kills on instantiation.', function(){
        var hero = new Hero(0,0);
        expect(hero.mineCount).to.equal(0);
        expect(Object.keys(hero.minesOwned).length).to.equal(0);
        expect(hero.heroesKilled.length).to.equal(0);
      });

      it ('Should be of the hero type.', function(){
        var hero = new Hero(0,0);
        expect(hero.type).to.equal('Hero');
      });

      it('Should have health of 100 on instantiation.', function(){
        var hero = new Hero(0,0);
        expect(hero.health).to.equal(100);
      });

      it('Should not be dead on instantiation.', function(){
        var hero = new Hero(0,0);
        expect(hero.dead).to.equal(false);
      });

      it('Should have no diamonds on instantiation.', function(){
        var hero = new Hero(0,0);
        expect(hero.diamondsEarned).to.equal(0);
      });

      it('Should have no damage done on instantiation.', function(){
        var hero = new Hero(0,0);
        expect(hero.damageDone).to.equal(0);
      });

    });

    describe('Hero methods.', function(){
      it ('Should be able to kill other heros.', function(){
        var hero1 = new Hero(0,0);
        var hero2 = new Hero(0,1);
        hero1.killedHero(hero2);
        expect(hero1.heroesKilled).to.have.length(1);
      });

      it ('Should be able to take damage and not be killed.', function(){
        var hero1 = new Hero(0,0);
        hero1.takeDamage(99);
        expect(hero1.dead).to.equal(false);
      });

      it ('Should be able to take damage and be killed.', function(){
        var hero1 = new Hero(0,0);
        hero1.takeDamage(100);
        expect(hero1.dead).to.equal(true);
      });

      it('Only return the damage actually needed to kill this hero.', function(){
        var hero = new Hero(0,0);
        hero.takeDamage(90);
        expect(hero.takeDamage(20)).to.equal(10);
      });

      it('Should be able to heal.', function(){
        var hero = new Hero(0,0);
        hero.takeDamage(25);
        hero.healDamage(25);
        expect(hero.health).to.equal(100);
      });

      it('Should not be able to heal beyond 100 health.', function(){
        var hero = new Hero(0,0);
        hero.takeDamage(5);
        hero.healDamage(25);
        expect(hero.health).to.equal(100);
      });

      it('Should be able to capture mines.', function(){
        var hero = new Hero(0,0);
        var d = new DiamondMine(0,1);
        d.id = 1;
        hero.captureMine(d, 10);
        expect(hero.mineCount).to.equal(1);
      });

      it('Should take damage when capturing a mine.', function(){
          var hero = new Hero(0,0);
          var d = new DiamondMine(0,1);
          d.id = 1;
          hero.captureMine(d, 10);
          expect(hero.health).to.equal(90);
      });

      it('Should be able to lose control of a mine.', function(){
          var hero = new Hero(0,0);
          var d = new DiamondMine(0,1);
          d.id = 1;
          hero.captureMine(d, 10);
          hero.loseMine(d);
          expect(hero.mineCount).to.equal(0);
      });

    });
  });

  describe('Impassable.js', function() {
    it('Should take X and Y coordinates.', function(){
      var rock = new Impassable(0,0);
      expect(rock.distanceFromTop).to.equal(0);
      expect(rock.distanceFromLeft).to.equal(0);
    });

    it('Should have the type of "Rock".', function(){
      var rock = new Impassable(0,0);
      expect(rock.type).to.equal('Rock');
    });

    it('Should not have an initial ID.', function(){
      var rock = new Impassable(0,0);
      expect(rock.id).to.equal(undefined);
    });
  }); 

  describe('Unoccupied.js', function() {
    it('Should take X and Y coordinates.', function(){
      var rock = new Impassable(0,0);
      expect(rock.distanceFromTop).to.equal(0);
      expect(rock.distanceFromLeft).to.equal(0);
    });

    it('Should have the type of "Unoccupied".', function(){
      var u = new Unoccupied(0,0);
      expect(u.type).to.equal('Unoccupied');
    });
  });

  describe('Game.js', function() {
    describe('Game object properties', function(){
      xit('Should not take any arguments.', function(){
        var game = new Game(0,0);
        expect(game).to.throw(error)
      });

      it('Should instantiate a board.', function(){
        var game = new Game(5);
        expect(!!game.board).to.equal(true);
      });

      it('Should have intial properties.', function(){
        var game = new Game(5);
        expect(game.heroes).to.have.length(0);
        expect(game.diamondMines).to.have.length(0);
        expect(game.healthWells).to.have.length(0);
        expect(game.impassables).to.have.length(0);
      });

      it('Should start a game at turn 0.', function(){
        var game = new Game(5);
        expect(game.turn).to.equal(0);
      });

      it('Should not start immediately.', function(){
        var game = new Game(5);
        expect(game.hasStarted).to.equal(false);
      });
    });
  });

  describe('Game object methods', function(){
    it('Should add a hero to the game.', function(){
      var game = new Game();
      var hero = game.addHero(0,0);
      expect(game.heroes).to.have.length(1);
    });
    it('Should add a hero to the game.', function(){
      var game = new Game();
      var hero = game.addHero(0,0);
      expect(game.heroes).to.have.length(1);
    });
  });

});