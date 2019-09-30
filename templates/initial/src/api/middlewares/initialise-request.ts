// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';
import uuid from 'uuid/v4';

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger } from '../../utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const initialiseRequest = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = new Date();
    const trackingId = uuid();

    req.startTime = startTime;
    req.trackingId = trackingId;

    logger.info(
        {
            startTime,
            trackingId,
            method: req.method,
            path: req.originalUrl,
        },
        'Request received',
    );

    return next();
};
