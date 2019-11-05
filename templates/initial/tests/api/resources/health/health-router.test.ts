jest.mock('../../../../src/api/resources/health/health-actions.ts');

// ------------------------------- NODE MODULES -------------------------------

import request from 'supertest';

// ------------------------------ CUSTOM MODULES ------------------------------

import * as health from '../../../../src/api/resources/health';
import { app } from '../../../../src/api/api';
import { appConfig } from '../../../../src/config';

// -------------------------------- VARIABLES ---------------------------------

const mockedHealth = health as jest.Mocked<typeof health>;

// ----------------------------- FILE DEFINITION ------------------------------

describe('healthcheck', (): void => {
    test('returns 200 if test passes', async (): Promise<void> => {
        mockedHealth.assertApiIsHealthy.mockResolvedValueOnce();

        await request(app)
            .get(`${appConfig.base}/health`)
            .expect(200);
    });

    test('returns 500 if test fails', async (): Promise<void> => {
        mockedHealth.assertApiIsHealthy.mockRejectedValueOnce(new Error('API unhealthy'));

        await request(app)
            .get(`${appConfig.base}/health`)
            .expect(500);
    });
});
