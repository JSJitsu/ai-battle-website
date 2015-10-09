/**
 * Copy this file to secrets.js and fill it in with your own information.
 */
var secrets = module.exports = {};

/**
 * The connection string to reach MongoDB.
 * @type {String}
 */
secrets.mongoKey = '';

/**
 * Sent to GitHub as the User-Agent as required by their API.
 * @type {String}
 */
secrets.appName = '';

/**
 * Sent to GitHub to connect to their API.
 * @type {String}
 */
secrets.appKey = '';

/**
 * Sent to GitHub to connect to their API.
 * @type {String}
 */
secrets.appSecret = '';

/**
 * Used to get a bearing on where to save and retrieve user code.
 * @type {String}
 */
secrets.rootDirectory = '.';

/**
 * The map to use for the battle. See game_logic/maps for a list.
 * Do not include the file extension.
 * @type {String}
 */
secrets.map = '';