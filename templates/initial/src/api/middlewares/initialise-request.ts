// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger } from '../../utils';

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
