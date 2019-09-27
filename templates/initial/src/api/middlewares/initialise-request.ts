// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';
import uuid from 'uuid/v4';

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger } from '../../utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const initialiseRequest = (req: Request, res: Response, next: NextFunction): void => {
    req.startTime = new Date();
    req.trackingId = uuid();

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
