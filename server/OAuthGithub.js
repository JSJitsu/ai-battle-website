'use strict';

let GitHubStrategy = require('passport-github2').Strategy;
let passport = require('passport');
let session = require('express-session');
let pgSession = require('connect-pg-simple')(session);
let bodyParser = require('body-parser');

module.exports = function (app, db, dbHelper, options) {

    app.use(
        session({
            store: new pgSession({
                conString: db.config
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

    app.get('/userInfo/games', requireAuth, function (req, res) {
        let user = req.user;
        let username = user.github_login;

        return dbHelper.getGameResultsByUsername(username).then(function (gameResults) {

            user.games = gameResults || [];

            user.games.forEach(function (game) {

                if (!game.heroes) {
                    game.gameResult = 'Missing Data';
                    return;
                }

                game.gameResult = 'Second Place';

                for (let hero of game.heroes) {
                    if (hero.name === username) {
                        if (hero.team.toString() === game.winning_team) {
                            game.gameResult = 'Winner!';
                            break;
                        }
                    }
                }

                delete game.heroes;
            });

            res.send(user);
        });
    });

    app.get('/userInfo/stats/recent', requireAuth, function (req, res) {
        let user = req.user;
        let username = user.github_login;

        return dbHelper.getLatestGameResultByUsername(username).then(function (gameResults) {
            let gameResult = gameResults[0];

            if (gameResult) {
                let playerDataIndex = gameResult.players.indexOf(username);

                if (playerDataIndex !== -1) {
                    user.recent_stats = gameResult.heroes[playerDataIndex];

                    if (gameResult.winning_team === user.recent_stats.team) {
                        user.recent_stats.gameResult = 'Winner!';
                    } else {
                        user.recent_stats.gameResult = 'Second Place';
                    }
                }
            }

            // Player has not played any games yet
            if (!user.recent_stats) {
                user.recent_stats = {};
            }

            res.send(user);
        });
    });

    app.get('/userInfo/stats/average', requireAuth, function (req, res) {
        let user = req.user;
        let username = user.github_login;

        return dbHelper.getAllGameResultsByUsername(username).then(function (gameResults) {

            let deaths = 0;
            let kills = 0;
            let kdRatio = 0;
            let minesTaken = 0;
            let damageGiven = 0;
            let gravesTaken = 0;
            let healthGiven = 0;
            let diamondsEarned = 0;
            let healthRecovered = 0;

            gameResults.forEach(function (gameResult) {
                let playerDataIndex = gameResult.players.indexOf(username);

                if (playerDataIndex !== -1) {
                    let stats = gameResult.heroes[playerDataIndex];

                    deaths += (stats.dead ? 1 : 0);
                    kills += stats.kills;
                    kdRatio += (kills / (deaths || 1));
                    minesTaken += stats.minesTaken;
                    damageGiven += stats.damageGiven;
                    gravesTaken += stats.gravesTaken;
                    healthGiven += stats.healthGiven;
                    diamondsEarned += stats.diamondsEarned;
                    healthRecovered += stats.healthRecovered;
                }
            });

            let totalGames = gameResults.length;

            if (totalGames > 0) {
                kills = (kills / totalGames).toFixed(2);
                kdRatio = (kdRatio / totalGames).toFixed(2);
                minesTaken = (minesTaken / totalGames).toFixed(2);
                damageGiven = (damageGiven / totalGames).toFixed(2);
                gravesTaken = (gravesTaken / totalGames).toFixed(2);
                healthGiven = (healthGiven / totalGames).toFixed(2);
                diamondsEarned = (diamondsEarned / totalGames).toFixed(2);
                healthRecovered = (healthRecovered / totalGames).toFixed(2);
            }

            user.average_stats = {
                gamesPlayed: totalGames,
                kdRatio,
                kills,
                minesTaken,
                damageGiven,
                gravesTaken,
                healthGiven,
                diamondsEarned,
                healthRecovered
            };

            res.send(user);
        });
    });

    // Makes the current user's info available
    app.get('/userInfo', function (req, res) {
        res.json(req.user);
    });

    // Make the current user's code repository updatable
    var urlEncodedBodyParser = bodyParser.urlencoded({
        extended: false
    });

    app.post('/userInfo', requireAuth, bodyParser.json(), urlEncodedBodyParser, function (req, res) {

        let user = req.user;
        let data = req.body;
        let codeRepo = data.code_repo;

        if (codeRepo && typeof codeRepo === 'string') {
            user.code_repo = data.code_repo;

            let record = {
                github_login: user.github_login,
                code_repo: user.code_repo
            };

            return dbHelper.updatePlayer(record).done(function () {
                res.send(record);
            });

        } else {
            res.send('user.code_repo must be a non-empty string');
        }

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

                return dbHelper.insertPlayer(record).then(dbHelper.getFirstResult);
            }

        }).then(function (user) {
            done(null, user.github_login);
        });
    });

    passport.deserializeUser(function (githubHandle, done) {
        dbHelper.getPlayer(githubHandle).then(function (users) {
            let user = users[0];

            return dbHelper.getPlayerLifetimeStats(githubHandle).then(function (stats) {
                if (stats[0]) {
                    user.lifetime_stats = stats[0];
                }

                return user;
            });
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

    // Go here to log out
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // This is where github sends us after it finishes authenticating us
    app.get('/auth/github/callback', passport.authenticate('github', {
        successRedirect: '/',
        failureRedirect: '/'
    }));

};
