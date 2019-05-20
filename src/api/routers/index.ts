// ------------------------------- NODE MODULES -------------------------------

import { Express } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import helloWorld from './hello-world';

// -------------------------------- VARIABLES ---------------------------------

const routers = [helloWorld];

// ----------------------------- FILE DEFINITION ------------------------------

export const loadRouters = (app: Express): void => {
    routers.forEach((router): Express => router(app));

    return;
};
