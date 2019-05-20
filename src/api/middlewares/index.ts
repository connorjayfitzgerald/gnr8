// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger } from '../../utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const logRequest = (req: Request, res: Response, next: NextFunction): void => {
    logger.debug(`${req.method} request received at ${req.path}`);

    return next();
};
