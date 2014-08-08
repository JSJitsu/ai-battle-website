# DOCKER-VERSION 0.10.1
FROM ubuntu:latest

# Update app
RUN  apt-get update

# Install Node.js and npm
RUN  apt-get install -y nodejs npm git git-core

# Bundle app source
ADD . /src

# Install app dependencies
RUN cd src/src; ls; npm install

EXPOSE  8080

CMD ["nodejs", "src/src/index.js"]