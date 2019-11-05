// ------------------------------- NODE MODULES -------------------------------

import { Request, Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { errors, handleError } from '../../utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const methodNotAllowed = (req: Request, res: Response): Promise<Response> =>
    handleError(errors.general.MethodNotAllowed, req, res);
