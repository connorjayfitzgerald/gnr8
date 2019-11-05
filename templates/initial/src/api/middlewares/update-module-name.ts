// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction, RequestHandler } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const updateModuleName = (prefix?: string): RequestHandler => (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    const moduleName = `${prefix || ''}${req.path.split('/')[1]}`;

    req.context.moduleName = moduleName;

    return next();
};
