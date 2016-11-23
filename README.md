[![Build Status](https://travis-ci.org/JSJitsu/ai-battle-website.svg?branch=master)](https://travis-ci.org/JSJitsu/ai-battle-website)
# Javascript Battle Game Runner

Tool to run the games that the website is able to replay. Real or test data can be used to generate a battle.

## Playing The Game
Visit [https://jsfight.club](https://jsfight.club).

## Development

### Requirements

To work on this application, you must have the following installed:

- [Node.js](http://nodejs.org/) 6.x minimum
- [PostgreSQL](http://www.postgresql.org/) 9.5 minimum

### Initial Setup

The first step is to install PostgreSQL. Run the following command and carefully follow the prompts. It will have you install PostgreSQL, create a user, and give that user permission to modify the `jsfightclub` database. Simply read the output to know what to do at each step.

```sh
database/setup-postgres.sh
```

Next, copy the config file template so you can configure the application. This file will not be tracked, so you don't have to worry about accidentally committing your passwords and such.

```sh
cp config-template.js config.js
```

Don't forget to fill _config.js_ with your information!

Install necessary dependencies.

```sh
npm install
bower install
```

Set up the database tables.

```sh
database/initialize.js
psql jsfightclub < ./node_modules/connect-pg-simple/table.sql
```

### Running a Battle

To run a test battle:

```sh
node gamerunner/run-test-game.js
```

### Starting the Server

The website is not built automatically, but you can do so via the following command:

```sh
npm run build
```

You must build one time before starting the server in order to provide the game engine to the browser. After that, it is only necessary after making changes.

To start the server without connecting to Github, run:

```sh
node server.js --no-github
```

Once it's running, you can navigate to http://localhost:8080/ to view the site.

### Changing the Website
In order to speed up development of the website, you can view the "dev build" of the site at "dev.html" while the built version will be accessible from "index.html". There are no pre-compilation steps for doing basic site development. Once you're happy with the dev version of the site, re-build it using the previously-mentioned command and verify that your changes are alive and well in the built version.