// ------------------------------- NODE MODULES -------------------------------

import { Request, Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { ErrorItem } from './error-handler';
import { CommonError } from '../types';
import { closeConnection } from '../db/db';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const endRequest = async (
    req: Request,
    res: Response,
    status: number,
    body?: Record<string, any> | null,
): Promise<Response> => {
    clearTimeout(res.timer);

    const endTime = new Date();

    const {
        context,
        context: { connection, startTime },
        method,
        originalUrl,
    } = req;

    await closeConnection(context, connection);

    const logAttrs = {
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        method,
        path: originalUrl,
    };

    if (res.headersSent) {
        context.log.info(logAttrs, 'Not responding as a response has already been sent');

        return res;
    }

    context.log.info(logAttrs, 'Sending response');

    return res.status(status).send(body ? { data: body } : null);
};

export const endRequestWithFailure = async (
    req: Request,
    res: Response,
    status: number,
    errors: ErrorItem[] | CommonError[],
): Promise<Response> => {
    clearTimeout(res.timer);

    const endTime = new Date();

    const {
        context,
        context: { connection, startTime },
        method,
        originalUrl,
    } = req;

    await closeConnection(context, connection);

    const logAttrs = {
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        method,
        path: originalUrl,
    };

    if (res.headersSent) {
        context.log.info(logAttrs, 'Not responding with failure as a response has already been sent');

        return res;
    }

    context.log.info(logAttrs, 'Sending failure response');

    return res.status(status).send({ errors });
};
