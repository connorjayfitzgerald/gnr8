# gnr8

### Description

gnr8 is a command-line utility for scaffolding a new RESTful API.

The current structure consists of an Express.js API which communicates with an Oracle database.

### Prerequisites

You'll need to follow the installation instructions for oracledb [here](https://oracle.github.io/node-oracledb/INSTALL.html#quickstart).

### Installation

If you're using npm version 5.2.0 or greater, you can use npx so as to always use the latest version of gnr8.

```
$ npx gnr8
```

Otherwise, you should install gnr8 globally and have your global npm modules on your path so that it may be run via the terminal.

```
$ npm i -g gnr8
```

#### Usage

Scaffold a new application by running...

```
$ npx gnr8 init
or
$ gnr8 init
if installed globally
```

###### Options

###### -n --name
Specify the name of the application via the terminal. Name should be lower kebab case, e.g. my-new-app.

###### -d --description
Specify a description via the terminal.

###### --no-db
gnr8 should not prompt for database credentials, as these will be added later.

###### --skip-install
Do not install dependencies. This will need to be done later with 'npm install'.

### Roadmap

* Use gnr8 to scaffold new resources for an existing API.
* Provide more options initially, such as which type of database to integrate with.

### People

gnr8 was developed by [Connor Fitzgerald](https://github.com/connorjayfitzgerald).