// ------------------------------- NODE MODULES -------------------------------

import { Router } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { helloRouter } from './hello';
import { healthRouter } from './health';
import { checkAuth, updateModuleName } from '../middlewares';

// -------------------------------- VARIABLES ---------------------------------

const unsecuredRouters: ((app: Router) => Router)[] = [];
const securedRouters: ((app: Router) => Router)[] = [helloRouter, healthRouter];

// ----------------------------- FILE DEFINITION ------------------------------

export const loadRouters = (app: Router): void => {
    app.use(updateModuleName());

    unsecuredRouters.forEach((router): Router => router(app));

    app.use(checkAuth);

    securedRouters.forEach((router): Router => router(app));

    return;
};
