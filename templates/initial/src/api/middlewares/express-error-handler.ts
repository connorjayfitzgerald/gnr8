// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, NextFunction } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { endRequestWithFailure } from '../../utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

// 4 parameters are required for Express to recognise this as an error handler
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): Promise<Response> => {
    if (err instanceof SyntaxError) {
        return endRequestWithFailure(req, res, 400, [{ detail: 'Malformed request body' }]);
    }

    return endRequestWithFailure(req, res, 400, [{ detail: 'Bad request' }]);
};
