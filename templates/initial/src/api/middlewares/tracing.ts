// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction, RequestHandler } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { TracingFields, $TracingFields } from '../../types';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const setTracing = (fields: Partial<TracingFields>): RequestHandler => (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    Reflect.ownKeys(fields)
        .map((key): string => String(key))
        .forEach((key): void => {
            req[key] = fields[key];
        });

    return next();
};

export const getTracing = (req: Request): $TracingFields => {
    const { user, moduleName, trackingId, query, params } = req;

    return {
        user,
        moduleName,
        trackingId,
        query,
        params,
    };
};
