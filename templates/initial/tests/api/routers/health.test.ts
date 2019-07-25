jest.mock('../../../src/core/health.ts');

// ------------------------------- NODE MODULES -------------------------------

import request from 'supertest';

// ------------------------------ CUSTOM MODULES ------------------------------

import { health } from '../../../src/core';
import { app } from '../../../src/api';
import { appConfig } from '../../../src/config';

// -------------------------------- VARIABLES ---------------------------------

const mockedHealth = health as jest.Mocked<typeof health>;

// ----------------------------- FILE DEFINITION ------------------------------

test('Healthy API returns 200', async (): Promise<void> => {
    mockedHealth.isApiHealthy.mockResolvedValueOnce(true);

    await request(app)
        .get(`${appConfig.base}/health`)
        .expect(200);
});

test('Unhealthy API returns 500', async (): Promise<void> => {
    mockedHealth.isApiHealthy.mockResolvedValueOnce(false);

    await request(app)
        .get(`${appConfig.base}/health`)
        .expect(500);
});
