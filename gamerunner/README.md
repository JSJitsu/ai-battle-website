# Javascript Battle Game Runner

Tool to run the games that the website is able to replay. Real or test data can be used to generate a battle.

## Table of Contents

1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
	2. [Generate Battle Data](#generate-battle-data)
    3. [Stack](#stack)

## Development

### Installing Dependencies

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

### Stack

Our stack includes the above dependencies, which you can read more about here:
- [Node](http://nodejs.org/)
- [PostgreSQL](http://www.postgresql.org/)
