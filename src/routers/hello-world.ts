// ------------------------------- NODE MODULES -------------------------------

import { Express, Request, Response, Router } from 'express';
import { body } from 'express-validator/check';

// ------------------------------ CUSTOM MODULES ------------------------------

import { handleError, checkValidation } from '../utils';
import { helloWorld } from '../core';

// -------------------------------- VARIABLES ---------------------------------

const base = '/hello-world';

// ----------------------------- FILE DEFINITION ------------------------------

export default (app: Express): Express => {
    const router = Router();

    app.use(base, router);

    router.post(
        '/',
        body('name', 'must be provided and alphabetical')
            .isAlpha()
            .isLength({ min: 1 }),
        checkValidation,
        async (req: Request, res: Response): Promise<Response> => {
            try {
                const { name } = req.body;

                const message = await helloWorld.sayHello(name);

                return res.status(200).send({
                    data: {
                        message,
                    },
                });
            } catch (err) {
                return handleError(err, res);
            }
        },
    );

    return app;
};
