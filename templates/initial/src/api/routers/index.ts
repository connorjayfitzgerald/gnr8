// ------------------------------- NODE MODULES -------------------------------

import { Router } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { helloRouter } from './hello';
import { healthRouter } from './health';
import { checkAuth } from '../middlewares';

// -------------------------------- VARIABLES ---------------------------------

const routers: ((app: Router) => Router)[] = [helloRouter, healthRouter];

// ----------------------------- FILE DEFINITION ------------------------------

export const loadRouters = (app: Router): void => {
    app.use(checkAuth);

    routers.forEach((router): Router => router(app));

    return;
};
