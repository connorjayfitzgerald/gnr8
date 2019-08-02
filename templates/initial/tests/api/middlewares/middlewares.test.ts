process.env.EXPRESS_TIMEOUT_SECS = '1';

// ------------------------------- NODE MODULES -------------------------------

import express, { Response } from 'express';
import request from 'supertest';

// ------------------------------ CUSTOM MODULES ------------------------------

import { timeoutMiddleware } from '../../../src/api/middlewares';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

const app = express();

app.use(timeoutMiddleware);

app.get(
    '/',
    (req, res): void => {
        req.startTime = new Date();

        setTimeout((): Response => res.status(200).send(), 5000);
    },
);

test('408 response occurs if request exceeds timeout', async (): Promise<void> => {
    await request(app)
        .get('/')
        .expect(408);
});
