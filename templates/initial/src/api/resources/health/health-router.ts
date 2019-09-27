// ------------------------------- NODE MODULES -------------------------------

import { Router, Request, Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { endRequest, endRequestWithFailure } from '../../../utils';
import { assertApiIsHealthy } from '.';
import { appConfig } from '../../../config';
import { methodNotAllowed, setTracing, getTracing } from '../../middlewares';

// -------------------------------- VARIABLES ---------------------------------

const base = '/health';

// ----------------------------- FILE DEFINITION ------------------------------

export const healthRouter = (app: Router): Router => {
    const router = Router();

    app.use(base, router);

    router.use(setTracing({ moduleName: 'health' }));

    /**
     * Check the health of the application.
     */
    router
        .route('/')
        .get(
            async (req: Request, res: Response): Promise<Response> => {
                const tracing = getTracing(req);

                try {
                    await assertApiIsHealthy(tracing);

                    return endRequest(req, res, 200, appConfig.health);
                } catch (err) {
                    return endRequestWithFailure(req, res, 500, [
                        { detail: 'API is currently in an unhealthy state', meta: appConfig.health },
                    ]);
                }
            },
        )
        .all(methodNotAllowed);

    return app;
};
