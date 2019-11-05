process.env.EXPRESS_TIMEOUT_SECS = '1';

// ------------------------------- NODE MODULES -------------------------------

import express, { Response } from 'express';
import request from 'supertest';

// ------------------------------ CUSTOM MODULES ------------------------------

import { startTimer } from '../../../src/api/middlewares';
import { Context } from '../../../src/utils';
import { appConfig } from '../../../src/config';
import { app } from '../../../src/api/api';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

test('408 response occurs if request exceeds timeout', async (): Promise<void> => {
    const fakeApp = express();

    fakeApp.use(startTimer);

    fakeApp.get('/', (req, res): void => {
        req.context = new Context();

        setTimeout((): Response => res.status(200).send(), 5000);
    });

    await request(fakeApp)
        .get(`${appConfig.base}`)
        .expect(408);
});

test('405 occurs if URL is valid but method is not', async (): Promise<void> => {
    await request(app)
        .put(`${appConfig.base}/hello`)
        .expect(405);
});

test('404 occurs if URL is not valid', async (): Promise<void> => {
    await request(app)
        .put(`${appConfig.base}/made-up`)
        .expect(404);
});
