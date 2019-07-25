// ------------------------------- NODE MODULES -------------------------------

import { LoggerOptions } from 'pino';

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

const {
    API_BASE,
    API_NAME,
    API_PORT,
    API_VERSION,
    BUILD_NUMBER,
    DB_CONNECTION_STRING,
    DB_ENABLE_STATS,
    DB_STATS_INTERVAL,
    DB_PASSWORD,
    DB_POOL_ALIAS,
    DB_POOL_INCREMENT,
    DB_POOL_MAX,
    DB_POOL_MIN,
    DB_USER,
    EXPRESS_TIMEOUT_SECS,
    GIT_HASH,
    LOG_LEVEL,
    LOG_PRETTY,
    LOG_SQL,
} = process.env;

// ----------------------------- FILE DEFINITION ------------------------------

const requiredVariables = [
    'API_NAME',
    'API_PORT',
    'API_VERSION',
    'BUILD_NUMBER',
    'DB_CONNECTION_STRING',
    'DB_PASSWORD',
    'DB_USER',
    'EXPRESS_TIMEOUT_SECS',
    'GIT_HASH',
];

const missingVariables: string[] = [];

requiredVariables.forEach((variable: string): void => {
    if (!process.env[variable]) {
        missingVariables.push(variable);
    }
});

if (missingVariables.length > 0) {
    throw new Error(`Missing mandatory environment variables: ${missingVariables.join(', ')}`);
}

export const appConfig = {
    base: API_BASE || '',
    port: API_PORT,
    timeout: EXPRESS_TIMEOUT_SECS ? parseInt(EXPRESS_TIMEOUT_SECS) : 120,
    health: {
        build: BUILD_NUMBER,
        hash: GIT_HASH,
        name: API_NAME,
        version: API_VERSION,
    },
};

export const dbConfig = {
    connection: {
        string: DB_CONNECTION_STRING,
        user: DB_USER,
        password: DB_PASSWORD,
    },
    pool: {
        alias: DB_POOL_ALIAS || '#KEBAB_CASED#',
        min: DB_POOL_MIN ? parseInt(DB_POOL_MIN) : 3,
        max: DB_POOL_MAX ? parseInt(DB_POOL_MAX) : 5,
        increment: DB_POOL_INCREMENT ? parseInt(DB_POOL_INCREMENT) : 1,
    },
    stats: {
        enabled: DB_ENABLE_STATS === 'true',
        interval: DB_STATS_INTERVAL ? parseInt(DB_STATS_INTERVAL) : 60,
    },
    logging: {
        logQueries: LOG_SQL === 'true',
    },
};

export const loggerConfig: LoggerOptions = {
    level: LOG_LEVEL || 'debug',
    prettyPrint: LOG_PRETTY === 'true',
};
