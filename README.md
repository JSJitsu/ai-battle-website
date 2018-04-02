[![Build Status](https://travis-ci.org/JSJitsu/ai-battle-website.svg?branch=master)](https://travis-ci.org/JSJitsu/ai-battle-website)

# Javascript Fight Club

This repository contains the code that runs the website. By forking this, you will be able to develop the site, use real (GitHub player AI code), or use test data to generate a battle.

## Playing The Game

Visit [https://jsfight.club](https://jsfight.club) to play the game. You do not need a copy of this repo to play.

## Development

### Via Docker (recommended)

See the [Docker website](https://www.docker.com/community-edition) for more information.

```sh
docker build -t ai-battle-website .
docker run -it -v $(pwd):/app -p 8080:8080 ai-battle-website
```

Once inside, running `./docker-startup.sh` will get everything started. It should start the PostgreSQL service, install npm modules, create the database and tables, run a test game, and start the web server. Access the site at http://localhost:8080/.

### Via Vagrant (might be outdated)

See the [Vagrant website](https://www.vagrantup.com/) for more information.

```
vagrant up
vagrant ssh
```

Then, navigate to the _/vagrant_ directory.

### Running a Battle

To run a test battle:

```sh
node gamerunner/run-test-game.js
```

### Starting the Web Server

```sh
yarn run build
```

You must build one time before starting the server in order to provide the game engine to the browser.

To start the server without connecting to GitHub, run:

```sh
node server.js
```

Run `node server.js --help` for additional start-up options.

Once it's running, you can navigate to http://localhost:8080/ to view the site. (if you're using the Vagrant environment, navigate to http://localhost:4000/ instead)

### Changing the Website

There are currently no build steps, so once the server is up and running, only changing the website UI files is enough to see the changes. When making changes to the server, it will need to be restarted each time.

### Changing the Database Schema

Database changes and queries are handled by [http://knexjs.org/](Knex.js).

To create a new Knex migration:

```sh
$ knex migrate:make migration_name ./database/config/knexfile.js
```

Example:

Suppose you want to add the column 'foo' to 'players' table:

```sh
$ knex migrate:make add_foo_to_players ./database/config/knexfile.js
```

The migration file will be created under _./database/migrations_.

IMPORTANT: Always add the up and down changes to the Knex migration file. This is what will allow easy rollbacks in case something goes wrong.
