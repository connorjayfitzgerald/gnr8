// ------------------------------- NODE MODULES -------------------------------

import express from 'express';
import bodyParser from 'body-parser';

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger } from './utils';
import { loadRouters } from './api/routers';
import { appConfig } from './config';
import { logRequest } from './api/middlewares';

// -------------------------------- VARIABLES ---------------------------------

const { port } = appConfig;

// ----------------------------- FILE DEFINITION ------------------------------

const run = async (): Promise<void> => {
    try {
        const app = express();

        app.use(bodyParser.json());
        app.use(logRequest);

        loadRouters(app);

        app.listen(port, (): void => logger.info(`API listening on port ${port}`));
    } catch (err) {
        logger.error(err);
    }
};

run();
