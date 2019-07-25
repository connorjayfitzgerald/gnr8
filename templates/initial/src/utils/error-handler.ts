// ------------------------------- NODE MODULES -------------------------------

import { Request, Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { CustomError, logger, oraErrors } from '.';
import { endRequestWithFailure } from './end-request';

// -------------------------------- VARIABLES ---------------------------------

export const defaultError = 'An error occurred whilst processing the request. Please try again later.';

// ----------------------------- FILE DEFINITION ------------------------------

export interface ErrorItem {
    detail: string;
    code?: number;
}

const processError = (err: Error | CustomError): ErrorItem => {
    let result: ErrorItem = {
        detail: defaultError,
    };

    if (err instanceof CustomError) {
        result = {
            detail: err.message,
        };
        if (typeof err.code === 'number') result.code = err.code;
    }

    return result;
};

export const handleError = (err: Error | CustomError, req: Request, res: Response): Response => {
    let errors: ErrorItem[] = [];
    let status = 500;

    logger.error(err);

    if (err.message.includes('ORA-')) {
        const startIndex = err.message.indexOf('ORA-');
        const endIndex = startIndex + err.message.substring(startIndex).indexOf(':');

        const oraCode = err.message.substring(startIndex, endIndex);
        if (oraErrors[oraCode]) {
            err = oraErrors[oraCode];
        }
    }

    if (err.message.includes('DPI-')) {
        const startIndex = err.message.indexOf('DPI-');
        const endIndex = startIndex + err.message.substring(startIndex).indexOf(':');

        const oraCode = err.message.substring(startIndex, endIndex);
        if (oraErrors[oraCode]) {
            err = oraErrors[oraCode];
        }
    }

    if (err.message.includes('NJS-')) {
        const startIndex = err.message.indexOf('NJS-');

        const endIndex = startIndex + err.message.substring(startIndex).indexOf(':');
        const oraCode = err.message.substring(startIndex, endIndex);
        if (oraErrors[oraCode]) {
            err = oraErrors[oraCode];
        }
    }

    if (err instanceof CustomError) {
        errors.push(processError(err));

        status = err.status;
    }

    if (errors.length === 0) {
        errors.push({
            detail: defaultError,
        });
    }

    return endRequestWithFailure(req, res, status, errors);
};
