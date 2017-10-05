const console = require('better-console');
const request = require('request');
const fs = require('fs');
const path = require('path');
const config = require('../../config.js');
const db = require('../../database/connect.js');

// count to end the db connection once all async opts are done.
let count = 0;

if (!config || !config.github || !config.github.appKey || !config.github.appSecret || !config.github.appName) {
    console.error('Missing github configuration needed to retrieve user code. Check config.js.');
    process.exit(1);
}

function initiateCodeRequest (fileType) {

    console.log('About to retrieve user code from Github...');

    // TODO: swap below query to not inculed disbaled accounts
    // const q = "SELECT * FROM player WHERE disabled = false";
    const q = "SELECT * FROM player";
    db.query(q, function (err, users) {
        if (err) {
            throw err;
        }


        if (!users.length) {
            console.warn('No users were found in the database, so user code could not be retrieved from Github.');
        } else {
            /**
             * @todo Get hero and helper code for a single user at the same time rather than getting
             * all of the hero code and then all of the helper code.
             */
            retrieveCode(users, 'hero');
            retrieveCode(users, 'helpers');
        }

    });
}

function retrieveCode (users, category) {

    count++;
    users.forEach(function (user, i) {
        const githubHandle = user.github_login;
        const codeRepo = user.code_repo;

        if (!githubHandle || !codeRepo) {
            console.warn('Skipping bad user record:', user);
            return;
        }

        const options = {
            // Saves the URL at which the code can be found
            url: `https://api.github.com/repos/${githubHandle}/${codeRepo}/contents/${category}.js`,
            qs: {
                client_id: config.github.appKey,
                client_secret: config.github.appSecret,
            },
            headers: {
                'User-Agent': config.github.appName
            }
        };

        // Sends the request for each user's hero.js and helper.js file to the github API
        request(options, function (error, response, body) {
            console.log(`Saving code for ${githubHandle} / ${category}`);

            if (error) {
                console.warn('Error sending request!');
                console.warn(error);
                return disableUser(user, 'fetch');
            }

            // If everything is ok, save the file
            if (response.statusCode === 200) {
                // Get response as JSON
                const info = JSON.parse(body);

                if (info.size > 65536) {
                    console.warn(`${githubHandle} script size of ${info.size} is larger than 64k`);
                    return disableUser(user, `${category}_overweight`);
                }

                // Set up buffer to write file
                const buffer = new Buffer(info.content, 'base64');

                // Convert buffer to long string
                const usersCode = buffer.toString('utf8');

                const filePath = path.resolve(__dirname, category, `${githubHandle}_${category}.js`);

                const directory = path.dirname(filePath);

                // See if our target directory exists and create it if it doesn't
                try {
                    fs.statSync(directory);
                } catch (e) {
                    console.log('Making directory', directory);
                    fs.mkdirSync(directory);
                }

                // Write the file to a predefined folder and file name
                fs.writeFile(filePath, usersCode, function (err) {
                    if (err) {
                        console.error(`Error writing file: ${filePath}`);
                        console.error(err);
                    }
                    return updateDisableValues(user, error, true);
                });
            } else {
                /**
                 * @todo Detect 404 responses and have the ability to prune dead accounts after a certain
                 * number of failures.
                 */
                if (response.statusCode === 404) {
                    console.warn('Unexpected response code:', response.statusCode, 'from', options.url, 'with message', body);
                    return disableUser(user, `missing_${category}`);
                }
            }
        });
    });
}

/**
 * Using the updated user object, check to see if it has been update today, if not update user
 * @param  {Number} id    - the users github_id
 * @param  {String} error - The error for disable_message
 */
function disableUser ({ github_id }, error) {
    return getUser(github_id)
        .then(([user]) => !sameDay(user.last_update_date) ? updateDisableValues(user, error) : false )
        .catch(e => console.warn(e));
}

/**
 * Get the user from the db in case the last_update_date has been updated
 * @param  {Number} id   - the users github_id
 * @retrun {Object} user - the newly updated user object
 * @retrun {Error}  err  - error
 */
function getUser (id) {
  return new Promise((res, rej) => {
      db.query(`SELECT * FROM player WHERE github_id = ${id}`, function (err, user) {
          if (err) { return rej(err); }
          return res(user);
      });
  });
}

/**
 * Check to see if provided date is today
 * @param  {Date} date - The last_update_date from the user object
 * @return {Bool}      - True if same day, False if different days
 */
function sameDay (date) {
    if (!date) return false;
    const [update] = date.toISOString().split('T');
    const [current] = new Date().toISOString().split('T');
    return  (update === current);
}

/**
 * Update the disable values, if called with success it removes all disabled based values
 * @param  {Object} user    -  The updated user object
 * @param  {String} error   - The error for disable_message
 * @param  {Bool}   success - True if function is called after files have been writen
 */
function updateDisableValues (user, error, success) {
    const date = success ? 'last_update_date = null' : 'last_update_date = localtimestamp';
    const q = `UPDATE player SET disabled = $1, disabled_count = $2, disabled_message = $3, ${date} WHERE github_id = $4`;
    const disabled = user.disabled_count >= 2 ? true : false;
    const disabledCount = ++user.disabled_count;
    const values = success ? [false, 0, null, user.githud_id] : [disabled, disabledCount, error, user.github_id];
    db.update(q, values, (err, update) => {
        count--;
        if (err) {
            throw err;
        }
        if (count === 0) {
            db.end();
        }
        return;
    });
}

initiateCodeRequest();
