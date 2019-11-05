// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger } from './logger';
import { endRequestWithFailure } from './end-request';
import { CommonError } from '../types';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const checkValidation = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        logger.error(
            {
                errors: errors.array(),
                method: req.method,
                path: req.originalUrl,
            },
            'Request validation failed',
        );

        const mappedErrors: CommonError[] = errors.array().map(
            (error: ValidationError): CommonError => {
                const mappedError: CommonError = {
                    detail: error.msg,
                };

                if (['query', 'params'].includes(String(error.location))) {
                    mappedError.source = {
                        parameter: error.param,
                    };
                } else if (error.location === 'body') {
                    mappedError.source = {
                        pointer: `${error.param}`,
                    };
                }

                return mappedError;
            },
        );

        return endRequestWithFailure(req, res, 400, mappedErrors);
    }

    return next();
};
