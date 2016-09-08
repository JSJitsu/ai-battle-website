#!/bin/bash
DBNAME='jsfightclub'

sudo apt-get install postgresql-9.5
sudo service postgresql start

echo "Creating database user $USER"
sudo -u postgres createuser --superuser $USER

echo ""
echo "You need to set a password for your database user."
echo "To do so, type the following in the PostgreSQL prompt:"
echo ""
echo "    \password $USER"
echo ""
echo "When you are done, type the following to leave:"
echo ""
echo "    \q"
echo ""

sudo -u postgres psql

echo "Creating database $DBNAME..."
sudo -u postgres createdb $DBNAME

echo ""
echo "You need to grant permission to your user to the database."
echo "To do so, type the following in the PostgreSQL prompt:"
echo ""
echo "    GRANT ALL PRIVILEGES ON DATABASE $DBNAME to $USER;"
echo ""
echo "When you are done, type the following to leave:"
echo ""
echo "    \q"
echo ""

sudo -u postgres psql