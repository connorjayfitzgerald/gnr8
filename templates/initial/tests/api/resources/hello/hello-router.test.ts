jest.mock('../../../../src/api/resources/hello/hello-actions.ts');

// ------------------------------- NODE MODULES -------------------------------

import request from 'supertest';

// ------------------------------ CUSTOM MODULES ------------------------------

import * as hello from '../../../../src/api/resources/hello';
import { app } from '../../../../src/api/api';
import { appConfig } from '../../../../src/config';
import { CustomError } from '../../../../src/utils';

// -------------------------------- VARIABLES ---------------------------------

const mockedHello = hello as jest.Mocked<typeof hello>;

// ----------------------------- FILE DEFINITION ------------------------------

test('GET /hello successfully says hello', async (): Promise<void> => {
    const name = 'Tester';

    mockedHello.sayHello.mockResolvedValueOnce(`Hello, ${name}`);

    const response = await request(app)
        .get(`${appConfig.base}/hello?name=${name}`)
        .expect(200);

    expect(response.body.data.message).toBe(`Hello, ${name}`);
});

test('GET /hello hides unexpected errors', async (): Promise<void> => {
    mockedHello.sayHello.mockRejectedValueOnce(new Error('An unexpected error'));

    await request(app)
        .get(`${appConfig.base}/hello?name=${name}`)
        .expect(500);
});

test('GET /hello returns expected errors', async (): Promise<void> => {
    mockedHello.sayHello.mockRejectedValueOnce(new CustomError('An expected error', 418));

    await request(app)
        .get(`${appConfig.base}/hello?name=${name}`)
        .expect(418);
});

test('GET /hello fails without a name', async (): Promise<void> => {
    await request(app)
        .get(`${appConfig.base}/hello`)
        .expect(400);
});
