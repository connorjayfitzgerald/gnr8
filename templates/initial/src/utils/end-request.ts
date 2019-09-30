// ------------------------------- NODE MODULES -------------------------------

import { Request, Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger } from '.';
import { ErrorItem } from './error-handler';
import { CommonError } from '../types';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const endRequest = (
    req: Request,
    res: Response,
    status: number,
    body?: Record<string, any> | null,
): Response => {
    clearTimeout(res.timer);

    const endTime = new Date();

    const logAttrs = {
        user: req.user,
        startTime: req.startTime,
        endTime,
        duration: endTime.getTime() - req.startTime.getTime(),
        method: req.method,
        path: req.originalUrl,
    };

    if (res.headersSent) {
        logger.info(logAttrs, 'Not responding as a response has already been sent');

        return res;
    }

    logger.info(logAttrs, 'Sending response');

    return res.status(status).send(body ? { data: body } : null);
};

export const endRequestWithFailure = (
    req: Request,
    res: Response,
    status: number,
    errors: ErrorItem[] | CommonError[],
): Response => {
    clearTimeout(res.timer);

    const endTime = new Date();

    const { user, startTime, method, originalUrl, trackingId } = req;

    const logAttrs = {
        trackingId,
        user,
        startTime,
        endTime,
        duration: endTime.getTime() - req.startTime.getTime(),
        method,
        path: originalUrl,
    };

    if (res.headersSent) {
        logger.info(logAttrs, 'Not responding with failure as a response has already been sent');

        return res;
    }

    logger.info(logAttrs, 'Sending failure response');

    return res.status(status).send({ errors });
};
