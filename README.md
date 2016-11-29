[![Build Status](https://travis-ci.org/JSJitsu/ai-battle-website.svg?branch=master)](https://travis-ci.org/JSJitsu/ai-battle-website)
# Javascript Fight Club

This repository contains the code that powers the website. By forking this, you will be able to develop the site code, or use real (github player ai code) or test (just local versions of those scripts) data to generate a battle.

## Playing The Game
Visit [https://jsfight.club](https://jsfight.club) to play the game. You do not need a copy of this repo to play.

## Development

### Requirements

To work on this application, you must have the following installed:

- [Node.js](http://nodejs.org/) 6.x minimum
- [PostgreSQL](http://www.postgresql.org/) 9.5 minimum

### Initial Setup

#### Database Setup

Run the following command and carefully follow the prompts to install PostgreSQL, create a user, and give that user permission to modify the `jsfightclub` database. Simply read the output to know what to do at each step.

```sh
database/setup-postgres.sh
```

#### Configuration

Next, copy the config file template so you can configure the application. This file will not be tracked, so you don't have to worry about accidentally committing your passwords and such.

```sh
cp config-template.js config.js
```

The most important pieces of information to add to  _config.js_ are the database user and database password. Everything else can be skipped for now.

#### Dependency Installation

```sh
npm install
bower install
```

#### Add Database Tables

```sh
database/initialize.js
psql jsfightclub < ./node_modules/connect-pg-simple/table.sql
```

### Running a Battle

Running battles does not require the web server in order to run.

To run a test battle:

```sh
node gamerunner/run-test-game.js
```

### Starting the Web Server

The website is not built automatically, but you can do so via the following command:

```sh
npm run build
```

You must build one time before starting the server in order to provide the game engine to the browser. After that, it is only necessary after making changes.

To start the server without connecting to Github, run:

```sh
node server.js --no-github
```

You can also run `node server.js` with no options to show the help screen.

Once it's running, you can navigate to http://localhost:8080/ to view the site.

### Changing the Website
You can view the "dev build" of the site at _dev.html_ while the built version will be accessible from _index.html_. There are no pre-compilation steps for doing development via _dev.html_. Once you're happy with the dev version of the site, re-build it using `npm run build` and verify that your changes are alive and well in the built version.