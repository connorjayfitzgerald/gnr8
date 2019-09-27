# #SPACE_CASED#

### Installing

```
npm install
```

### Available NPM Commands

```npm run dev```
Run the API in the devleopment mode. This requires a .env file to be populated by following the included template.

Please note that **dotenv** is a development dependency and will not take effect in a production build.

```npm run build```
Run the Typescript compiler to produce a production build in **./dist**.

```npm run clean```
Remove the production build by deleting the following directories:
* **./dist**
* **./coverage**

```npm run lint```
Run **eslint** against the **./src** directory and attempt to automatically fix any errors.

```npm run prod```
Runs ```npm run build``` as described above and attempts to run the production build.

### Running the Automated Unit Tests
```npm test```
This will use **jest** to run all tests within the **'./tests** directory.

### Notes
* Pretty logs should always be **disabled** in production, as they will affect performance and log processing.

### Environment Variables

**API_BASE** - Base path after the host and port. Defaults to /.
**API_NAME** - Name of the API to be returned when performing a health check.
**API_PORT** - Port to run the API on. Required.
**API_VERSION** - Semantic version of the API to be returned when performing a health check.
**BUILD_NUMBER** - Build number to be returned when performing a health check.
**DB_CALL_TIMEOUT** - How many seconds before attempting to break execution.
**DB_CONNECTION_STRING** - Connection string of the database. Required.
**DB_ENABLE_STATS** - If true, periodically log out database statistics. Defaults to false.
**DB_STATS_INTERVAL** - Seconds interval at which database statistics should be output. Defaults to 60.
**DB_PASSWORD** - Password of the database user. Required.
**DB_POOL_ALIAS** - Alias for the database connection pool. Defaults to #KEBAB_CASED#.
**DB_POOL_INCREMENT** - Number of new connections to open when requests exceeds connections available. Defaults to 1.
**DB_POOL_MAX** - Maximum number of connections in the pool. Defaults to 5.
**DB_POOL_MIN** - Minimum number of connections in the pool. Defaults to 3.
**DB_USER** - Username of the database user. Required.
**EXPRESS_TIMEOUT_SECS** - Seconds after which Express should response with 408 Request Timeout. Defaults to 60.
**GIT_HASH** - Hash of the Git commit to be returned when performing a health check.
**LOG_LEVEL** - One of: fatal, error, debug, warn, trace. Defaults to debug.
**LOG_PRETTY** - If true, prettify outputted logs. Not to be used in production. Defaults to false.
**LOG_SQL** - If true, log out queries and bind parameters. Defaults to false.
**NODE_ENV** - Should be set to development or production for performance benefits. Defaults to development.

### Dependencies

* [body-parser](https://www.npmjs.com/package/body-parser) - Parsing body from HTTP requests
* [express](https://expressjs.com/) - Web API framework
* [express-validator](https://express-validator.github.io/docs/) - Simple API for validating requests
* [helmet](https://helmetjs.github.io/) - Easily add some HTTP security
* [oracledb](https://github.com/oracle/node-oracledb) - For communicating with an Oracle Database
* [pino](https://github.com/pinojs/pino) - Logging framework
* [pino-pretty](https://github.com/pinojs/pino-pretty) - Add-on for prettifying log statements. May be disabled via environment variables.