// ------------------------------- NODE MODULES -------------------------------

import { Pool } from 'oracledb';

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger } from './utils';
import { appConfig, loggerConfig } from './config';
import { createPool } from './db';
import { app } from './api';

// -------------------------------- VARIABLES ---------------------------------

const { port } = appConfig;
const { level } = loggerConfig;

// ----------------------------- FILE DEFINITION ------------------------------

const run = async (): Promise<void> => {
    let pool: Pool | null = null;

    try {
        pool = await createPool();

        app.listen(port, (): void => {
            logger.info(
                {
                    port,
                    logLevel: level,
                },
                'API ready to accept connections',
            );

            logger.warn('Please ensure UV_THREADPOOL_SIZE was set in the terminal before starting this application');

            logger.warn(`Express request timeout set to ${appConfig.timeout} seconds`);
        });
    } catch (err) {
        logger.error(err);

        if (pool) {
            await pool.close();
        }
    }
};

run();
