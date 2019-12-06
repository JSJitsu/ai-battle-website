FROM ubuntu:16.04

# Set proxy server, replace host:port with values for your servers
# ENV http_proxy http://10.4.119.1:3128
# ENV https_proxy http://10.4.119.1:3128

ENV PG_APP_HOME="/etc/docker-postgresql"\
    PG_VERSION=9.5 \
    PG_USER=postgres \
    PG_HOME=/var/lib/postgresql \
    PG_RUNDIR=/run/postgresql \
    PG_LOGDIR=/var/log/postgresql \
    PG_CERTDIR=/etc/postgresql/certs

ENV PG_BINDIR=/usr/lib/postgresql/${PG_VERSION}/bin \
    PG_DATADIR=${PG_HOME}/${PG_VERSION}/main

# Install.
RUN apt-get update && apt-get install -y curl wget ack-grep fish git vim sudo \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && echo 'deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main' > /etc/apt/sources.list.d/pgdg.list \
    && curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash - \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y postgresql-${PG_VERSION} nodejs yarn

# Define working directory.
WORKDIR /app

# Copy the current directory contents into the container
ADD . /app

RUN cp config-template.js config.js
RUN chmod +x bootstrap-docker.sh
RUN bash bootstrap-docker.sh

RUN yarn install
RUN yarn run build

EXPOSE 8080

# Define default command.
CMD ["bash"]