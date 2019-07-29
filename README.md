# gnr8

### Description

gnr8 is a command-line utility for scaffolding a new RESTful API.

The current structure consists of an Express.js API which communicates with an Oracle database.

### Installation and Usage

Generated APIs are written in Typescript. In order for these to be run in development mode, [ts-node](https://github.com/TypeStrong/ts-node) can be used. Install this globally with:

```
npm i -g ts-node
```

If you're using npm version 5.2.0 or greater, you can use npx so as to always use the latest version of gnr8.

```
$ npx gnr8
```

Otherwise, you should install gnr8 globally and have your global npm modules on your path so that it may be run via the terminal.

```
$ npm i -g gnr8
```

You will then be prompted for some information before gnr8 scaffolds a new application.

#### Options

##### -n --name
Specify the name of the application via the terminal. Name should be lower kebab case, e.g. my-new-app

##### -d --description
 Specify a description via the terminal.

##### --no-db
gnr8 should not prompt for database credentials, as these will be added later.

### Roadmap

* Use gnr8 to scaffold new resources for an existing API.
* Provide more options initially, such as which type of database to integrate with.

### People

gnr8 was developed by [Connor Fitzgerald](https://github.com/connorjayfitzgerald)