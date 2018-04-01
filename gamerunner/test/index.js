/* global describe, it, */
const chai = require('chai');
const expect = chai.expect;
const spies = require('chai-spies');

chai.use(spies);

describe('Test GameRunner', function () {

    const gameRunner = require('../game_logic/GameRunner.js');

    it ('can be instantiated', function () {
        expect(new gameRunner()).to.be.an.instanceOf(gameRunner);
    });

});
