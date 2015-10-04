# Javascript Battle Webworkers

Generates test data that the Javascript Battle Website can use to replay a battle.

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
If you don't already have [MongoDB](http://www.mongodb.org/) installed, follow their instructions to install and start it for your OS.

### Generate Battle Data
Once your dependencies are installed, look for the configuration file "secrets-template.js". Update it with your own settings and rename it to "secrets.js" so it can be found by the script.

To run the test battle:
```sh
node local-run/run-fake-games-local.js
```

### Stack

Our stack includes the above dependencies, which you can read more about here:
- [Node](http://nodejs.org/)
- [Express](http://expressjs.com/)
- [MongoDB](http://www.mongodb.org/)