
# Project Name

Every day there is an epic battle between legendary heroes.  Control your hero with your own pre-submitted javascript function (your hero’s “brain”), and see the results of each day’s battle as your hero’s prowess is tested against the competition.

Sign up is as easy as logging into your github account, forking a “starter” repository, and opting in to the daily battle at javascriptbattle.com.  Learn from your past mistakes and make your hero smarter by customizing your code, and feel the power as your hero dominates the battlefield.

Such is the power of javascript.

## Team

&nbsp;&nbsp;&nbsp;&nbsp;Product Owner: Greg Trowbridge

&nbsp;&nbsp;&nbsp;&nbsp;Scrum Master: Forrest Thomas

&nbsp;&nbsp;&nbsp;&nbsp;Development Team Members: James Yothers and Jakob Harclerode

## Table of Contents

1. [Requirements](#requirements)
2. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Stack](#stack)
3. [Team](#team)
4. [Contributing](#contributing)


## Requirements
### NPM Modules
- Node 
- Express
- MongoDB
- Mongoose

### Bower Dependencies
- Backbone
- Bootsrap
- jQuery
- Modernizr
- Powerange
- Underscore

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install
bower install
```
### Stack

The stack behind Javascript Battle can be evenly divided into two categories:
- Website
- Game Engine

For the website, our stack includes the above dependencies, which you can read more about here:
- [Node](http://nodejs.org/)
- [Express](http://expressjs.com/)
- [MongoDB](http://www.mongodb.org/)
- [Mongoose](http://mongoosejs.com/)
- [Backbone](http://backbonejs.org/)
- [Bootsrap](http://getbootstrap.com/)
- [jQuery](http://jquery.com/)
- [Modernizr](http://modernizr.com/)
- [Powerange](http://www.jplugins.net/powerange/)
- [Underscore](http://underscorejs.org/)

Our game engine is hosted on [Microsoft Azure](https://azure.microsoft.com/en-us/), with the following stack:
- [Linux Ubuntu VM](http://azure.microsoft.com/en-us/documentation/articles/virtual-machines-linux-tutorial/)
- [Block Blob](http://azure.microsoft.com/en-us/documentation/articles/storage-dotnet-how-to-use-blobs/)
- [Docker](https://www.docker.com/)
- [Cron](https://help.ubuntu.com/community/CronHowto)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
