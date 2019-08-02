// ------------------------------- NODE MODULES -------------------------------

import { Result } from 'oracledb';

// ------------------------------ CUSTOM MODULES ------------------------------

import { health } from '../../src/core';
import { execute, connectionsInUse } from '../__mocks__/oracledb';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

afterEach(
    (): void => {
        expect(connectionsInUse).toBeLessThanOrEqual(0);
    },
);

test('Health check succeeds if the DB is active', async (): Promise<void> => {
    execute.mockResolvedValueOnce(({
        rows: [
            {
                IS_HEALTHY: 1,
            },
        ],
    } as unknown) as Result);

    const isHealthy = await health.isApiHealthy('DB_USER');

    expect(isHealthy).toBe(true);
});

test('Health check fails if the DB call fails', async (): Promise<void> => {
    execute.mockRejectedValueOnce(new Error('DB call failed'));

    const isHealthy = await health.isApiHealthy('DB_USER');

    expect(isHealthy).toBe(false);
});
