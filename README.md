# Javascript Battle Game Runner

Tool to run the games that the website is able to replay. Real or test data can be used to generate a battle.

# Playing The Game
Visit [jsfight.club](https://jsfight.club) to get started.

## Development

### Requirements

To work on this application, you must have the following installed:
- [Node](http://nodejs.org/) 6.x minimum
- [PostgreSQL](http://www.postgresql.org/) 9.5 minimum

### Initial Setup

From within the root directory:

```sh
npm install
```

If you don't already have [PostgreSQL](http://www.postgresql.org/) installed, you can likely use the helper script in `database/setup-postgres.sh` to get started.

### Generate Battle Data
Once your dependencies are installed, look for the configuration file "secrets-template.js". Update it with your own settings and rename it to "secrets.js" so it can be found by the script.

To run the test battle:

```sh
node run-test-game.js
```
