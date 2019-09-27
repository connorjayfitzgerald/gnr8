// ------------------------------- NODE MODULES -------------------------------

import { Request, Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { appConfig } from '../../config';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const notFound = (req: Request, res: Response): Response =>
    res.status(404).send({
        errors: [
            {
                detail: 'Resource not found',
                links: {
                    self: `${req.protocol}://${req.hostname}:${appConfig.port}${req.path}`,
                },
            },
        ],
    });
