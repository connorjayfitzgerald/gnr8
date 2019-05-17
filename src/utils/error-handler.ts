// ------------------------------- NODE MODULES -------------------------------

import { Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { CustomError, logger } from '.';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export default (err: Error | CustomError, res: Response): Response => {
    logger.error(err);

    let message = 'An error occurred whilst processing the request. Please try again later.';
    let status = 500;

    if (err instanceof CustomError) {
        message = err.message;
        status = err.status;
    }

    return res.status(status).send({
        errors: [
            {
                detail: message,
            },
        ],
    });
};
