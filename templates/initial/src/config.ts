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
    DB_CALL_TIMEOUT,
    DB_CONNECTION_STRING,
    DB_EXEC_STATS_ENABLED,
    DB_EXEC_STATS_INTERVAL,
    DB_PASSWORD,
    DB_POOL_ALIAS,
    DB_POOL_INCREMENT,
    DB_POOL_MAX,
    DB_POOL_MIN,
    DB_POOL_STATS_ENABLED,
    DB_POOL_STATS_INTERVAL,
    DB_USER,
    EXPRESS_TIMEOUT_SECS,
    GIT_HASH,
    LOG_LEVEL,
    LOG_PRETTY,
    LOG_SQL,
    METRICS_ENABLED,
    METRICS_COLLECT_INTERVAL_SECONDS,
    METRICS_LOG_INTERVAL_SECONDS,
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
    metrics: {
        enabled: METRICS_ENABLED === 'true',
        collectInterval: METRICS_COLLECT_INTERVAL_SECONDS ? parseInt(METRICS_COLLECT_INTERVAL_SECONDS) : 5,
        logInterval: METRICS_LOG_INTERVAL_SECONDS ? parseInt(METRICS_LOG_INTERVAL_SECONDS) : 60,
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
        pool: {
            enabled: DB_POOL_STATS_ENABLED === 'true',
            interval: DB_POOL_STATS_INTERVAL ? parseInt(DB_POOL_STATS_INTERVAL) : 60,
        },
        execution: {
            enabled: DB_EXEC_STATS_ENABLED === 'true',
            interval: DB_EXEC_STATS_INTERVAL ? parseInt(DB_EXEC_STATS_INTERVAL) : 10,
        },
    },
    logging: {
        logSql: LOG_SQL === 'true',
    },
    timeout: DB_CALL_TIMEOUT ? parseInt(DB_CALL_TIMEOUT) : 180,
};

export const loggerConfig: LoggerOptions = {
    level: LOG_LEVEL || 'debug',
    prettyPrint: LOG_PRETTY === 'true',
};
