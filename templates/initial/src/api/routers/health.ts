// ------------------------------- NODE MODULES -------------------------------

import { Router, Request, Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { endRequest, endRequestWithFailure } from '../../utils';
import { health } from '../../core';
import { appConfig } from '../../config';

// -------------------------------- VARIABLES ---------------------------------

const base = '/health';

// ----------------------------- FILE DEFINITION ------------------------------

export const healthRouter = (app: Router): Router => {
    const router = Router();

    app.use(base, router);

    /**
     * Check the health of the application.
     */
    router.get(
        '/',
        async (req: Request, res: Response): Promise<Response> => {
            const isHealthy = await health.isApiHealthy(req.user);

            if (isHealthy) {
                return endRequest(req, res, 200, appConfig.health);
            }

            return endRequestWithFailure(req, res, 500, [
                { detail: 'API is currently in an unhealthy state', meta: appConfig.health },
            ]);
        },
    );

    return app;
};
