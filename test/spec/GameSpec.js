/* global projects, describe, it, expect, should */
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var spies = require('chai-spies');
var Board = require('../../Board.js');
var DiamondMine = require('../../DiamondMine.js');
var Game = require('../../Game.js');
var HealthWell = require('../../HealthWell.js');
var Hero = require('../../Hero.js');
var Impassable = require('../../Impassable.js');
var Unoccupied = require('../../Unoccupied.js');
chai.use(spies);

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

  describe('Game object methods', function(){
    it('Should add a hero to the game.', function(){
      var game = new Game();
      var hero = game.addHero(0,0);
      expect(game.heroes).to.have.length(1);
    });

    it('Should place a hero on the game board.', function(){
      var game = new Game();
      var hero1 = game.addHero(0,0);
      expect(game.board.tiles[0][0]).to.have.property('health');
    });

    it('Should add a diamond mine to the game.', function(){
      var game = new Game();
      var d = game.addDiamondMine(0,0);
      expect(game.diamondMines).to.have.length(1);
    });

    it('Should place a diamond mine on the game board.', function(){
      var game = new Game();
      var d = game.addDiamondMine(0,0);
      expect(game.board.tiles[0][0]).to.have.property('type').that.deep.equals('DiamondMine');
    });

    it('Should add a health well to the game.', function(){
      var game = new Game();
      var hw = game.addHealthWell(0,0);
      expect(game.healthWells).to.have.length(1);
    });

    it('Should place a health well on the game board.', function(){
      var game = new Game();
      var hw = game.addHealthWell(0,0);
      expect(game.board.tiles[0][0]).to.have.property('type').that.deep.equals('HealthWell');
    });

    it('Should add an impassable object to the game.', function(){
      var game = new Game();
      var i = game.addImpassable(0,0);
      expect(game.impassables).to.have.length(1);
    });

    it('Should place an impassable object on the game board.', function(){
      var game = new Game();
      var i = game.addImpassable(0,0);
      expect(game.board.tiles[0][0]).to.have.property('type').that.deep.equals('Rock');
    });

    it('Should know what hero\'s turn it is.', function(){
      var game = new Game();
      var h1 = game.addHero(0,0);
      var h2 = game.addHero(0,1);
      var h3 = game.addHero(1,0);
      var h4 = game.addHero(0,2);
      game.turn = 1;
      expect(game.activeHero()).to.deep.equal(game.heroes[1]);
    });
    describe('handleHeroTurn method', function(){

      it('Should move the hero.', function(){
        var game = new Game();
        var h1 = game.addHero(0,0);
        game.handleHeroTurn('South');
        expect(game.heroes[0].distanceFromTop).to.equal(1);
      });

      it('Should not move the hero, if the hero is dead.', function(){
        var game = new Game();
        var h1 = game.addHero(0,0);
        game.heroes[0].dead = true;
        game.handleHeroTurn('South');
        expect(game.heroes[0].distanceFromTop).to.equal(0);
      });

      it('Should call the hero earnings method.', function(){
        var game = new Game();
        var h1 = game.addHero(0,0);
        game.heroes[0].mineCount = 1;
        game.handleHeroTurn('South');
        expect(game.heroes[0].diamondsEarned).to.equal(1);
      });

      it('Should call the hero attack method.', function(){
        var game = new Game();
        var h1 = game.addHero(0,0);
        game.heroes[0].takeDamage(100);
        game.handleHeroTurn('South');
        expect(game.heroes[0].dead).to.equal(true);
      });

      it('Should increment the turn.', function(){
        var game = new Game();
        var h1 = game.addHero(0,0);
        game.handleHeroTurn('South');
        game.handleHeroTurn('South');
        game.handleHeroTurn('South');
        expect(game.turn).to.equal(3);
      });
    });
    describe('Handle hero move', function(){
      it('Should not let the hero move off of the board.', function(){
        var game = new Game();
        var h1 = game.addHero(0,0);
        game.handleHeroTurn('North');
        expect(game.heroes[0].distanceFromTop).to.equal(0);
      });

      it('Should move the hero in the right direction.', function(){
        var game = new Game();
        var h1 = game.addHero(0,0);
        game.handleHeroTurn('South');
        game.handleHeroTurn('East');
        game.handleHeroTurn('South');
        game.handleHeroTurn('East');
        game.handleHeroTurn('North');
        game.handleHeroTurn('West');
        expect(game.heroes[0].distanceFromTop).to.equal(1);
        expect(game.heroes[0].distanceFromLeft).to.equal(1);
      });

      it('Should leave the previous tile unoccupied.', function(){
        var game = new Game();
        var h1 = game.addHero(0,0);
        game.handleHeroTurn('South');
        expect(game.board.tiles[0][0]).to.deep.equal(new Unoccupied(0,0));
      });

    });
    describe('handleHeroEarnings method', function() {

      it('Should increase diamondsEarned based on mineCount.', function() {
        var game = new Game();
        game.addHero(0,0);
        game.heroes[0].mineCount = 3;
        game._handleHeroEarnings(game.heroes[0]);
        expect(game.heroes[0].diamondsEarned).to.equal(3);
      });  

      it('Should not change diamondsEarned if mineCount does not increase.', function() {
        var game = new Game();
        game.addHero(0,0);
        game._handleHeroEarnings(game.heroes[0]);
        expect(game.heroes[0].diamondsEarned).to.equal(0);
      })


    }); 

    describe('handleHeroMove method', function() {

      it('Returns undefined if trying to move off the board.', function() {
        var game = new Game();
        game.addHero(0,0);
        var moveOffBoard = game._handleHeroMove(game.heroes[0], 'North');
        expect(moveOffBoard).to.equal(undefined);
        var moveOffBoard = game._handleHeroMove(game.heroes[0], 'West');
        expect(moveOffBoard).to.equal(undefined);
      });

      it('Makes soon-to-be vacated tile "unoccupied".', function() {
        var game = new Game();
        game.addHero(0,0);
        game._handleHeroMove(game.heroes[0], 'South');
        expect(game.board.tiles[0][0].type).to.equal("Unoccupied");
      });

      it('Updates hero\'s location (in hero)', function() {
        var game = new Game();
        game.addHero(0,0);
        game._handleHeroMove(game.heroes[0], 'South');
        expect(game.heroes[0].distanceFromTop).to.equal(1);
        expect(game.heroes[0].distanceFromLeft).to.equal(0);
      });

      it('Updates hero\'s location (on board)', function() {
        var game = new Game();
        game.addHero(0,0);
        game._handleHeroMove(game.heroes[0], 'South');
        expect(game.board.tiles[1][0]).to.equal(game.heroes[0]);
      });

      it('If hero tries to move on diamond mine he does not move.', function() {
        var game = new Game();
        game.addHero(0,0);
        game.addDiamondMine(1,0);
        game._handleHeroMove(game.heroes[0], 'South');
        expect(game.heroes[0].distanceFromTop).to.equal(0);
        expect(game.heroes[0].distanceFromLeft).to.equal(0);
      });

      it('If hero captures mine with enough health he doesn\'t die and is owner of the mine.', function() {
        var game = new Game();
        game.addHero(0,0);
        game.addDiamondMine(1,0);
        game._handleHeroMove(game.heroes[0], 'South');
        expect(game.heroes[0].dead).to.equal(false);
        expect(game.diamondMines[0].owner).to.equal(game.heroes[0]);
      });

      it('If hero captures mine with minimal health he dies.', function() {
        var game = new Game();
        game.addHero(0,0);
        game.heroes[0].health = 10;
        game.addDiamondMine(1,0);
        game._handleHeroMove(game.heroes[0], 'South');
        expect(game.heroes[0].dead).to.equal(true);
      });

      it('If hero tries to move over a healthwell he will get health and not move.', function() {
        var game = new Game();
        game.addHero(0,0);
        game.heroes[0].health = 10;
        game.addHealthWell(1,0);
        game._handleHeroMove(game.heroes[0], 'South');
        expect(game.heroes[0].health).to.equal(50);
        expect(game.heroes[0].distanceFromTop).to.equal(0);
        expect(game.heroes[0].distanceFromLeft).to.equal(0);
      });
    });

    describe('resolveHeroAttacks method', function() {
   
      it('one hero attacks another if in range', function() {
        var game = new Game();
        game.addHero(0,0);
        game.addHero(1,0);
        game._resolveHeroAttacks(game.heroes[0]);
        expect(game.heroes[1].health).to.equal(70);
      });

      it('remove hero from board if dead', function() {
        var game = new Game();
        game.addHero(0,0);
        game.addHero(1,0);
        game.heroes[1].health = 1;
        game._resolveHeroAttacks(game.heroes[0]);
        expect(game.board.tiles[1][0].type).to.equal('Unoccupied');
      });

      it('tell hero he killed someone', function() {
        var game = new Game();
        game.addHero(0,0);
        game.addHero(1,0);
        game.heroes[1].health = 1;
        game._resolveHeroAttacks(game.heroes[0]);
        expect(game.heroes[0].heroesKilled).to.have.length(1);
      });
    });

    describe('heroDied method', function() {

      it('removes dead hero from board', function() {
        var game = new Game();
        game.addHero(0,0);
        game.heroDied(game.heroes[0]);
        expect(game.board.tiles[0][0].type).to.equal('Unoccupied');
      });

    });
    

        


    }); 


  });

});