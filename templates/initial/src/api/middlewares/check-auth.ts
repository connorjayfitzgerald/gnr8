// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger, handleError } from '../../utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        logger.warn(`Authentication should be implemented in src/api/middlewares/check-auth.ts`);

        req.user = 'NOT_AUTHENTICATED';

        return next();
    } catch (err) {
        logger.error(err, 'Authentication failed');

        return handleError(err, req, res);
    }
};
