// ------------------------------- NODE MODULES -------------------------------

import { Result } from 'oracledb';

// ------------------------------ CUSTOM MODULES ------------------------------

import { hello } from '../../src/core';
import { execute, connectionsInUse } from '../__mocks__/oracledb';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

afterEach(
    (): void => {
        expect(connectionsInUse).toBeLessThanOrEqual(0);
    },
);

test('sayHello returns a hello message', async (): Promise<void> => {
    const message = 'Hello, Tester';

    execute.mockResolvedValueOnce(({
        outBinds: {
            message,
        },
    } as unknown) as Result);

    const result = await hello.sayHello('authedUser', 'Tester');

    expect(result).toBe(message);
});

test('sayHello is able to handle DB errors', async (): Promise<void> => {
    const errorMessage = 'DB call failed';

    execute.mockRejectedValueOnce(new Error(errorMessage));

    let error = null;

    try {
        await hello.sayHello('authedUser', 'Tester');
    } catch (err) {
        error = err;
    }

    expect(error).not.toBeNull();
    expect(error.message).toBe(errorMessage);
});
