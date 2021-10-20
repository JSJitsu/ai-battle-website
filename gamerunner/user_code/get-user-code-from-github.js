const console = require('better-console');
const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('../../config.js');
const db = require('../../database/knex');

if (!config || !config.github || !config.github.appKey || !config.github.appSecret || !config.github.appName) {
    console.error('Missing github configuration needed to retrieve user code. Check config.js.');
    process.exit(1);
}

console.log('Fetching list of users from the database.');

const NETWORK_ERROR = 'Code fetch error';
const MISSING_CODE = 'Missing code';

(async () => {

    let users = await db.select('*').from('player');

    if (!users.length) {
        console.warn('No users found in the database.');
        process.exit();
    }

    db.transaction(async function (trx) {
        let promise = await retrieveAllCode(users, trx);

        console.log('Done fetching user code.');

        // Allow updates to complete
        process.exit();
    });

})();

async function retrieveAllCode (users, trx) {

    console.log(`About to retrieve code for ${users.length} users!`);

    return new Promise((resolve, reject) => {

        let promise = users.reduce((prev, user) => {
            return prev.then(() => {
                return retrieveUserCode(user, 'hero');
            }).then(() => {
                return retrieveUserCode(user, 'helpers');
            });
        }, Promise.resolve());

        promise.then(() => {
            console.log('Updating the database.');
            trx.commit();
            resolve();
        })
        .catch(() => {
            console.warn('Rolling back changes to the database.');
            trx.rollback();
            reject();
        });

    });
}

function shouldRetrieveUserCode (user) {

    if (!user.github_login || !user.code_repo || user.disabledNow) {

        return false;

    } else if (user.enabled === false) {

        if (user.disable_reason !== MISSING_CODE && user.disable_reason !== NETWORK_ERROR) {
            return false
        }

    }

    return true;
}

async function retrieveUserCode (user, category) {

    const githubHandle = user.github_login;
    const codeRepo = user.code_repo;
    const codeBranch = user.code_branch;

    if (!shouldRetrieveUserCode(user)) {
        console.warn(`Skipping user ${githubHandle}.`);
        return;
    }

    let codeRequest = request({
        // Saves the URL at which the code can be found
        url: `https://api.github.com/repos/${githubHandle}/${user.code_repo}/contents/${category}.js?ref=${codeBranch}`,
        json: true,
        timeout: 10000,
        auth: {
            user: config.github.appKey,
            pass: config.github.appSecret,
        },
        headers: {
            'User-Agent': config.github.appName
        }
    });

    try {

        console.log(`Fetching code for ${githubHandle} / ${category}`);

        await codeRequest;
        handleGithubResponse(codeRequest, user, category);

    } catch (e) {

        let statusCode = codeRequest.response && codeRequest.response.statusCode || 0;
        let newValues = {
            enabled: false,
            disable_reason: NETWORK_ERROR
        };

        if (statusCode === 404) {
            newValues.disable_reason = MISSING_CODE;
        }

        user.disabledNow = true;

        return db('player')
        .where('github_login', githubHandle)
        .update(newValues)
        .then((updateCount) => {
            if (updateCount) {
                console.warn(`..temporarily disabling ${githubHandle} due to a ${statusCode} response.`);
            }
        })
        .catch(error => {
            console.error(error);
        });

    }

}

function handleGithubResponse (req, user, category) {

    let response = req.response;
    let githubHandle = user.github_login;

    let info = response.body;

    if (info.size > 65536) {
        console.warn(`..${githubHandle} script size of ${info.size} is larger than 64k`);
        return;
    }

    // "content" contains the user's code
    const buffer = new Buffer.from(info.content, 'base64');
    const usersCode = buffer.toString('utf8');

    // Decide where to save the code
    const filePath = path.resolve(__dirname, category, `${githubHandle}_${category}.js`);
    const directory = path.dirname(filePath);

    // See if our target directory exists and create it if it doesn't
    try {

        fs.statSync(directory);

    } catch (e) {

        console.log('..creating directory', directory);
        fs.mkdirSync(directory);

    }

    // Save the code
    try {

        fs.writeFileSync(filePath, usersCode);

        console.log(`..saving ${category} code for`, githubHandle);

        if (user.disable_reason === MISSING_CODE || user.disable_reason === NETWORK_ERROR) {

            // Re-activate a user if they were disabled due to missing code.
            return db('player')
            .where('github_login', githubHandle)
            .update({
                enabled: true,
                disable_reason: null
            })
            .then((updateCount) => {
                if (updateCount) {
                    console.log('..re-enabling player', githubHandle);
                }
            })
            .catch(error => {
                console.error(error);
            });

        }

    } catch (e) {

        console.error(`..error writing file "${filePath}"`);
        console.error(err);

    }

}