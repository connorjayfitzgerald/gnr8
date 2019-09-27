// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { appConfig } from '../../config';
import { endRequestWithFailure } from '../../utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

/**
 * This middleware will attach a timer to each request.
 */
export const startTimer = (req: Request, res: Response, next: NextFunction): void => {
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
