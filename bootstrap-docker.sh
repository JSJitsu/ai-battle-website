#!/usr/bin/env bash

DBNAME='jsfightclub'
DBUSER='vagrant'

service postgresql start

# Only create the database user if needed
user_check=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DBUSER'")
if [[ "$user_check" != "1" ]]; then
    sudo -u postgres createuser --superuser $DBUSER
    sudo -u postgres psql -c "ALTER USER $DBUSER WITH PASSWORD '1234';"
    echo "user $DBUSER created"
fi

# Only create the database if needed
if [[ "$(sudo -u postgres psql -tAc '\l')" != *"$DBNAME"* ]]; then
    sudo -u postgres createdb $DBNAME
    echo "db $DBNAME created"
fi
