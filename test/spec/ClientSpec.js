/* global projects, describe, it, expect, should */


describe('replay', function () {
  'use strict';

  beforeEach(function() {
 

  });

  it('jQuery exists', function () {
    expect($).to.be.a('function');

  });

  it('GameTile exists', function () {
    expect(typeof new GameTile()).to.equal('object');
  });

  it('does something else', function () {
    expect(true).to.equal(true);
  });

});