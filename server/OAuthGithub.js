'use strict';

let GitHubStrategy = require('passport-github2').Strategy;
let passport = require('passport');
let session = require('express-session');
let pgSession = require('connect-pg-simple')(session);
let bodyParser = require('body-parser');

module.exports = function (app, db, dbHelper, config, options) {

    app.use(
        session({
            store: new pgSession({
                conObject: db.client.connectionSettings
            }),
            secret: process.env.SESSION_SECRET || 'ilovejavascriptbattle',
            resave: false,
            saveUninitialized: true,
            cookie: {
                // 30 days
                maxAge: 30 * 24 * 60 * 60 * 1000
            }
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    function requireAuth (req, res, next) {
        if (!req.user) {
            res.status(401).end();
            return false;
        }

        next();
    }

    // Makes the current user's info available
    app.get('/api/user', function (req, res) {
        res.json(req.user || {
            success: false,
            message: 'Authentication required'
        });
    });

    // Make the current user's code repository updatable
    var urlEncodedBodyParser = bodyParser.urlencoded({
        extended: false
    });

    app.post('/api/user', requireAuth, bodyParser.json(), urlEncodedBodyParser, function (req, res) {

        let user = req.user;
        let data = req.body;
        let codeRepo = data.code_repo;
        let codeBranch = data.code_branch;

        user.code_repo = data.code_repo || 'hero-starter';
        user.code_branch = data.code_branch || 'master';

        if (data.enabled === "false") {
            user.enabled = false;
        } else {
            user.enabled = true;
        }

        let record = {
            github_login: user.github_login,
            code_repo: user.code_repo,
            code_branch: user.code_branch,
            enabled: user.enabled
        };

        return dbHelper.updatePlayer(record).then(function () {
            res.send(record);
        });

    });

    /**
     * Uses data from the Github login process to create a new player record, if needed.
     *
     * @param  {Object} githubData Github user data
     * @param  {Function} done Callback to serialize the user data.
     */
    passport.serializeUser(function (githubData, done) {
        dbHelper.getPlayer(githubData.username).then(function (users) {

            let user = users[0];

            if (user) {
                return user;
            } else {
                // Create a new user if we couldn't find one
                var record = {
                    github_login: githubData.username,
                    github_id: githubData.id,
                    avatar_url: githubData.avatar_url,
                    joined_at: new Date()
                };

                return dbHelper.insertPlayer(record).then(results => {
                    return results[0];
                });
            }

        }).then(function (user) {
            done(null, githubData.username);
        });
    });

    passport.deserializeUser(function (githubHandle, done) {
        dbHelper.getPlayer(githubHandle).then(function (users) {
            return users[0];
        })
            .done(
                function (user) {
                    done(null, user);
                },
                function (err) {
                    console.error(err);
                }
            );
    });

    let clientId = options.github.clientId || process.env.GITHUB_CLIENT_ID;
    let clientSecret = options.github.clientSecret || process.env.GITHUB_CLIENT_SECRET;
    let callbackURL = options.github.callbackUrl || process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/auth/github/callback';

    if (options.pretendAuthAs) {
        // Go here to login
        app.get('/auth/github', function (req, res) {

            let randomId = Math.floor(Math.random() * 1000000);
            let user = {
                username: options.pretendAuthAs,
                id: randomId,
                avatar_url: `https://avatars0.githubusercontent.com/u/${randomId}?v=4`
            };

            req.login(user, function (err) {
                return res.redirect('/');
            });
        });
    } else {
        passport.use('github', new GitHubStrategy(
            {
                clientID: clientId,
                clientSecret: clientSecret,
                callbackURL: callbackURL
            }, function (accessToken, refreshToken, profile, done) {
                done(null, profile);
            }
        ));

        // Go here to login
        app.get('/auth/github', passport.authenticate('github'));

        // This is where github sends us after it finishes authenticating us
        app.get('/auth/github/callback', passport.authenticate('github', {
            successRedirect: '/',
            failureRedirect: '/'
        }));
    }

    // Go here to log out
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

};
