// ------------------------------- NODE MODULES -------------------------------

import { Request, Response, Router } from 'express';
import { query } from 'express-validator';

// ------------------------------ CUSTOM MODULES ------------------------------

import { hello } from '../../core';
import { handleError, endRequest, checkValidation } from '../../utils';
import { isValidParameter } from '../validation/custom-validators';
import { methodNotAllowed } from '../middlewares';

// -------------------------------- VARIABLES ---------------------------------

const base = '/hello';

const validParameters = ['name'];

// ----------------------------- FILE DEFINITION ------------------------------

export const helloRouter = (app: Router): Router => {
    const router = Router();

    app.use(base, router);

    /**
     * Say hello.
     */
    router
        .route('/')
        .get(
            [
                query('*')
                    .custom(isValidParameter(validParameters))
                    .withMessage('Unrecognised query parameter'),
                query('name').exists(),
            ],
            checkValidation,
            async (req: Request, res: Response): Promise<Response> => {
                try {
                    const message = await hello.sayHello(req.user, req.query.name);

                    return endRequest(req, res, 200, { message });
                } catch (err) {
                    return handleError(err, req, res);
                }
            },
        )
        .all(methodNotAllowed);

    return app;
};
