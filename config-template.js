/**
 * Copy this file to config.js and fill it in with your own information.
 */
module.exports = {
    application: {
        /**
         * Used to get a bearing on where to save and retrieve user code.
         *
         * @type {String}
         */
        rootDirectory: '.',

        /**
         * The port on which the website should run.
         *
         * @type {Number}
         */
        port: 8080
    },
    database: {
        /**
         * The database username.
         *
         * @type {String}
         */
        user: process.env.USER,
        /**
         * The database password.
         *
         * @type {String}
         */
        password: '1234',
        /**
         * The IP address of the database.
         * The default is "127.0.0.1".
         *
         * @type {String}
         */
        address: '127.0.0.1',
        /**
         * The name of the database to use.
         * The default is "jsfightclub".
         *
         * @type {String}
         */
        name: 'jsfightclub'
    },
    /**
     * Information needed to connect to Github for user log-in and downloading
     * each user's code.
     *
     * @type {Object}
     */
    github: {
        /**
         * Sent to GitHub as the User-Agent as required by their API.
         * See https://github.com/settings/developers for more info.
         *
         * @type {String}
         */
        appName: '',

        /**
         * Sent to GitHub to connect to their API.
         * See https://github.com/settings/developers for more info.
         *
         * @type {String}
         */
        appKey: '',

        /**
         * Sent to GitHub to connect to their API.
         * See https://github.com/settings/developers for more info.
         *
         * @type {String}
         */
        appSecret: ''
    }
};