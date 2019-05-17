// ------------------------------- NODE MODULES -------------------------------

import { LoggerOptions } from 'pino';
import dotenv from 'dotenv';

dotenv.config();

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

const {
    API_PORT,
    LOG_LEVEL,
    LOG_PRETTY,
    DB_CONNECTION_STRING,
    DB_STATS_ENABLED,
    DB_STATS_INTERVAL,
    DB_PASSWORD,
    DB_POOL_ALIAS,
    DB_POOL_MAX,
    DB_POOL_MIN,
    DB_USER,
} = process.env;

// ----------------------------- FILE DEFINITION ------------------------------

const requiredVariables = ['API_PORT', 'DB_CONNECTION_STRING', 'DB_PASSWORD', 'DB_USER'];
const missingVariables: string[] = [];

requiredVariables.forEach(
    (variable: string): void => {
        if (!process.env[variable]) {
            missingVariables.push(variable);
        }
    },
);

if (missingVariables.length > 0) {
    throw new Error(`Missing mandatory environment variables: ${missingVariables.join(', ')}`);
}

export const appConfig = { port: API_PORT };

export const dbConfig = {
    connection: {
        string: DB_CONNECTION_STRING,
        user: DB_USER,
        password: DB_PASSWORD,
    },
    pool: {
        alias: DB_POOL_ALIAS || 'hello-world-pool',
        min: DB_POOL_MIN || 3,
        max: DB_POOL_MAX || 5,
    },
    stats: {
        enabled: DB_STATS_ENABLED === 'true',
        interval: DB_STATS_INTERVAL || 60,
    },
};

export const loggerConfig: LoggerOptions = {
    level: LOG_LEVEL || 'debug',
    prettyPrint: LOG_PRETTY === 'false',
};
