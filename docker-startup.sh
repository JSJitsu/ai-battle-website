#!/bin/sh
service postgresql start
yarn install
yarn run build
node ./node_modules/.bin/knex migrate:latest --knexfile=./database/config/knexfile.js
su - postgres -c 'cd /app; psql jsfightclub < ./node_modules/connect-pg-simple/table.sql'
node gamerunner/run-test-game.js
node server.js