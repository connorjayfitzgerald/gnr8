// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const catchBadJson = (err: Error, req: Request, res: Response, next: NextFunction): Response | void => {
    if (err instanceof SyntaxError) {
        return res.status(400).send({ errors: [{ detail: 'Malformed request body' }] });
    }

    return next();
};
