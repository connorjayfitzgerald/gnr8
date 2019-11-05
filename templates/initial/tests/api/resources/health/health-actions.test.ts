// ------------------------------- NODE MODULES -------------------------------

import { Result } from 'oracledb';

// ------------------------------ CUSTOM MODULES ------------------------------

import * as health from '../../../../src/api/resources/health';
import { execute } from '../../../__mocks__/oracledb';
import { Context } from '../../../../src/utils';

// -------------------------------- VARIABLES ---------------------------------

const context = new Context();

// ----------------------------- FILE DEFINITION ------------------------------

test('Health check succeeds if the DB is active', async (): Promise<void> => {
    execute.mockResolvedValueOnce(({
        rows: [
            {
                IS_HEALTHY: 1,
            },
        ],
    } as unknown) as Result<{ IS_HEALTHY: number }>);

    let errored = false;

    try {
        await health.assertApiIsHealthy(context);
    } catch (err) {
        errored = true;
    }

    expect(errored).toBe(false);
});

test('Health check fails if the DB call fails', async (): Promise<void> => {
    execute.mockRejectedValueOnce(new Error('DB call failed'));

    let errored = false;

    try {
        await health.assertApiIsHealthy(context);
    } catch (err) {
        errored = true;
    }

    expect(errored).toBe(true);
});
