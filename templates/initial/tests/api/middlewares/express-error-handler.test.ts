// ------------------------------- NODE MODULES -------------------------------

import request from 'supertest';

// ------------------------------ CUSTOM MODULES ------------------------------

import { app } from '../../../src/api/api';
import { errorHandler } from '../../../src/api/middlewares';
import { Response, Request } from 'express';
import { Context } from '../../../src/utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

test('Invalid JSON body returns 400', async (): Promise<void> => {
    await request(app)
        .post('/not-a-valid-route')
        .set('Content-Type', 'application/json')
        .send('{ NOT VALID JSON }')
        .expect(400);
});

test('Valid JSON body does not return 400', async (): Promise<void> => {
    const send = jest.fn();

    const res = ({
        status: () => ({
            send,
        }),
    } as unknown) as Response;

    await errorHandler(
        new Error('Not a syntax error'),
        {
            context: new Context(),
        } as Request,
        res,
        () => {},
    );

    expect(send).toHaveBeenCalledWith({ errors: [{ detail: 'Bad request' }] });
});
