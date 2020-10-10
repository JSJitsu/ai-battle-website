#!/usr/bin/env bash

#curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" > /etc/apt/sources.list.d/pgdg.list
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

apt-get update
apt-get install -y ack-grep
apt-get install -y fish
apt-get install -y git
#apt-get install -y nodejs
apt-get install -y postgresql-9.5

dpkg-divert --local --divert /usr/bin/ack --rename --add /usr/bin/ack-grep

DBNAME='jsfightclub'
DBUSER='vagrant'

service postgresql start

# Only create the database user if needed
user_check=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DBUSER'")
if [[ "$user_check" != "1" ]]; then
    sudo -u postgres createuser --superuser $DBUSER
    sudo -u postgres psql -c "ALTER USER $DBUSER WITH PASSWORD '1234';"
fi

# Only create the database if needed
if [[ "$(sudo -u postgres psql -tAc '\l')" != *"$DBNAME"* ]]; then
    sudo -u postgres createdb $DBNAME
fi

# Set up the initial config
if [ ! -f /vagrant/config.js ]; then
    cp /vagrant/config-template.js /vagrant/config.js
    chown vagrant:vagrant /vagrant/config.js
fi

npm install -g bower

# Change the shell to fish
chsh vagrant -s /usr/bin/fish
chsh -s /usr/bin/fish