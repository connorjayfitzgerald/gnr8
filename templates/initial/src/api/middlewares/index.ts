// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger, handleError, endRequestWithFailure } from '../../utils';
import { appConfig } from '../../config';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const initialiseRequest = (req: Request, res: Response, next: NextFunction): void => {
    req.startTime = new Date();

    logger.info(
        {
            startTime: req.startTime,
            method: req.method,
            path: req.originalUrl,
        },
        'Request received',
    );

    return next();
};

/**
 * This middleware will attach a timer to each request.
 */
export const timeoutMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    res.timer = setTimeout(
        (): Response =>
            endRequestWithFailure(req, res, 408, [
                {
                    detail: 'Request has timed out',
                },
            ]),
        appConfig.timeout * 1000,
    );

    return next();
};

export const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        logger.warn(`Authentication should be implemented in src/api/middlewares.checkAuth`);

        req.user = 'NOT_AUTHENTICATED';

        return next();
    } catch (err) {
        logger.error(err, 'Authentication failed');

        return handleError(err, req, res);
    }
};
