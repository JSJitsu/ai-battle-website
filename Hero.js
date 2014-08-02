var Hero = function(distanceFromTop, distanceFromLeft) {
  this.id = undefined;

  //Location
  this.distanceFromTop = distanceFromTop;
  this.distanceFromLeft = distanceFromLeft;

  //Mines
  this.minesOwned = {};
  this.mineCount = 0;

  //Personal
  this.health = 100;
  this.dead = false;

  //Stats
  this.diamondsEarned = 0;
  this.damageDone = 0;
  this.kills = 0;
  this.heroesKilled = [];

  //General
  this.type = 'Hero';
};

//
Hero.prototype.killedHero = function(otherHero) {
  this.kills++;
  this.heroesKilled.push(otherHero);
};

//Handles any situation in which the hero takes damage
//Returns the actual amount of damage taken
Hero.prototype.takeDamage = function(amount) {
  this.health -= amount;
  if (this.health <= 0) {
    this.dead = true;
    
    //Only return the damage actually needed
    //to kill this hero
    return amount + this.health;
  }

  //Return all the damage taken
  return amount;
};

//Handles any situation in which the hero heals damage
Hero.prototype.healDamage = function(amount) {
  this.health += amount;
  if (this.health > 100) {
    this.health = 100;
  }
};

//Take control of a diamond mine
Hero.prototype.captureMine = function(diamondMine, healthCost) {
  //Make sure mine is not already owned
  if (this.minesOwned.hasOwnProperty(diamondMine.id)) {
    //If so, do nothing
  } else {
    this.takeDamage(healthCost);

    if (!this.dead) {
      //Add this mine to mines owned
      this.minesOwned[diamondMine.id] = diamondMine;
      this.mineCount++;

      //remove this mine from its former owner
      var formerOwner = diamondMine.owner;
      if (formerOwner !== undefined) {
        formerOwner.loseMine(diamondMine);
      }
    }
  }
};

//Lose control of a diamond mine
Hero.prototype.loseMine = function(diamondMine) {
  //If this hero actually owns the given mine
  if (this.minesOwned.hasOwnProperty(diamondMine.id)) {
    //Lose control of the mine
    this.mineCount--;
    delete this.minesOwned[diamondMine.id];
  }
};


Hero.prototype.getCode = function() {
  var idStr = this.id.toString();
  if (idStr.length === 1) {
    idStr = '0' + idStr;
  }
  return 'H' + idStr;
};

module.exports = Hero;