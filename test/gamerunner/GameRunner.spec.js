/* global projects, describe, it, expect, should */
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const spies = require('chai-spies');

chai.use(spies);

describe('Test GameRunner', function () {

    const gameRunner = require('../../gamerunner/game_logic/GameRunner.js');
    const aiBattleEngineGame = require('ai-battle-engine/lib/game_classes/Game.js');
    const users = [
        {
            github_login: 'Lyn',
            github_id: '1234',
            avatar_url: 'avatar_url_1234',
            code_repo: 'code_repo',
            code_branch: 'code_branch',
            joined_at: '1999-01-08 04:05:06'
        },
        {
            github_login: 'Eliwood',
            github_id: '1235',
            avatar_url: 'avatar_url_1235',
            code_repo: 'code_repo',
            code_branch: 'code_branch',
            joined_at: '1999-02-08 04:05:06'
        },
        {
            github_login: 'Hector',
            github_id: '1236',
            avatar_url: 'avatar_url_1236',
            code_repo: 'code_repo',
            code_branch: 'code_branch',
            joined_at: '1999-03-08 04:05:06'
        },
        {
            github_login: 'Sain',
            github_id: '1237',
            avatar_url: 'avatar_url_1237',
            code_repo: 'code_repo',
            code_branch: 'code_branch',
            joined_at: '1999-04-08 04:05:06'
        },
        {
            github_login: 'Kent',
            github_id: '1238',
            avatar_url: 'avatar_url_1238',
            code_repo: 'code_repo',
            code_branch: 'code_branch',
            joined_at: '1999-05-08 04:05:06'
        },
    ];

    it ('can be instantiated', function () {
        expect(new gameRunner()).to.be.an.instanceOf(gameRunner);
    });

    it ('can be instantiated with Users array', function () {
        const gr = new gameRunner(users);
        expect(gr).to.be.an.instanceOf(gameRunner);
        expect(gr.users).to.equal(users);
        expect(gr.gamesCompleted).to.equal(0);
    });

    describe('planGames()', function () {

        it ('should set the GameRunner instance games and userLookup properties', function () {
            const gr = new gameRunner(users);
            expect(gr.games).to.be.undefined;
            expect(gr.userLookup).to.be.undefined;

            const games = gr.planGames(users);
            expect(gr.games).to.be.an('array').that.is.not.empty;
            expect(gr.games[0]).to.be.an.instanceOf(aiBattleEngineGame);
            expect(gr.userLookup.Lyn).to.equal(users[0]);
            expect(gr.userLookup.Eliwood).to.equal(users[1]);
            expect(gr.userLookup.Hector).to.equal(users[2]);
            expect(gr.userLookup.Sain).to.equal(users[3]);
            expect(gr.userLookup.Kent).to.equal(users[4]);
        });

    });

});
