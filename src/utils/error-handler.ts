// ------------------------------- NODE MODULES -------------------------------

import { Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { CustomError, ErrorList, logger } from '.';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

interface ErrorItem {
    detail: string;
}

export default (err: Error | CustomError | ErrorList, res: Response): Response => {
    let errors = [
        {
            detail: 'An error occurred whilst processing the request. Please try again later.',
        },
    ];
    let status = 500;

    if (err instanceof ErrorList) {
        status = err.status;

        errors = err.errors.map(
            (errItem): ErrorItem => {
                return {
                    detail: errItem.message,
                };
            },
        );

        logger.error(errors);
    } else {
        logger.error(err);
    }

    if (err instanceof CustomError) {
        errors = [
            {
                detail: err.message,
            },
        ];
        status = err.status;
    }

    return res.status(status).send({
        errors,
    });
};
