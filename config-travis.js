/**
 * This is used for the travis-ci build process.
 */
module.exports = {
    application: {
        rootDirectory: __dirname,
        port: 8080
    },
    database: {
        user: 'postgres',
        password: '',
        address: '127.0.0.1',
        name: 'travis_ci_test'
    },
    github: {
        appName: '',
        appKey: '',
        appSecret: ''
    }
};
