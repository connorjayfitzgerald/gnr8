// ------------------------------- NODE MODULES -------------------------------

import { Router } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { helloRouter } from '../resources/hello';
import { healthRouter } from '../resources/health';
import { checkAuth } from '../middlewares';

// -------------------------------- VARIABLES ---------------------------------

const routers: ((app: Router) => Router)[] = [helloRouter, healthRouter];

// ----------------------------- FILE DEFINITION ------------------------------

export const loadRouters = (app: Router): void => {
    app.use(checkAuth);

    routers.forEach((router): Router => router(app));

    return;
};
