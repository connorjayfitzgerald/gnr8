// ------------------------------- NODE MODULES -------------------------------

import pino from 'pino';

// ------------------------------ CUSTOM MODULES ------------------------------

import { loggerConfig } from '../config';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

const logger = pino(loggerConfig);

if (!process.env.LOG_LEVEL) {
    logger.info(`LOG_LEVEL not set. Default to 'debug'`);
}

export default logger;
