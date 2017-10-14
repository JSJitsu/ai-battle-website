/* global projects, describe, it, expect, should */
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const spies = require('chai-spies');

chai.use(spies);

describe('Test GameRunner', function () {

    const gameRunner = require('../../gamerunner/game_logic/GameRunner.js');

    it ('can be instantiated', function () {
        expect(new gameRunner()).to.be.an.instanceOf(gameRunner);
    });

});
