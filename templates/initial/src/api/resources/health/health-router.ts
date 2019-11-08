// ------------------------------- NODE MODULES -------------------------------

import { Router, Request, Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { endRequest, endRequestWithFailure, getMetrics } from '../../../utils';
import { assertApiIsHealthy } from '.';
import { appConfig, dbConfig } from '../../../config';
import { methodNotAllowed } from '../../middlewares';
import { getPoolStats } from '../../../db/db';

// -------------------------------- VARIABLES ---------------------------------

const base = '/health';

// ----------------------------- FILE DEFINITION ------------------------------

export const healthRouter = (app: Router): Router => {
    const router = Router();

    app.use(base, router);

    /**
     * Check the health of the application.
     */
    router
        .route('/')
        .get(
            async (req: Request, res: Response): Promise<Response> => {
                try {
                    const { context } = req;

                    await assertApiIsHealthy(context);

                    const pool = await getPoolStats(dbConfig.pool.alias);

                    return endRequest(req, res, 200, {
                        data: appConfig.health,
                        pool,
                        metrics: getMetrics(),
                    });
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
