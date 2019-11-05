// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { Context } from '../../utils/Context';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const initialiseRequest = (req: Request, _res: Response, next: NextFunction): void => {
    const context = new Context();

    req.context = context;

    const { method, originalUrl, body } = req;

    // On receiving the request log the path and method
    // If debug, also log the body
    if (context.log.isLevelEnabled('debug')) {
        context.log.debug(
            {
                method: method,
                path: originalUrl,
                body,
            },
            'Request received',
        );
    } else {
        context.log.info(
            {
                method: method,
                path: originalUrl,
            },
            'Request received',
        );
    }

    return next();
};
