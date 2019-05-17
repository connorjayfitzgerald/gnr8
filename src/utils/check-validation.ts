// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator/check';

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export default (req: Request, res: Response, next: NextFunction): Response | void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send({
            errors: errors.array(),
        });
    }

    return next();
};
