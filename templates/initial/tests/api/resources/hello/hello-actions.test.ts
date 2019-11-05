// ------------------------------- NODE MODULES -------------------------------

import { Result } from 'oracledb';

// ------------------------------ CUSTOM MODULES ------------------------------

import * as hello from '../../../../src/api/resources/hello';
import { execute } from '../../../__mocks__/oracledb';
import { Context } from '../../../../src/utils';
import { Username } from '../../../../src/types';

// -------------------------------- VARIABLES ---------------------------------

const context = new Context();
context.username = 'AUTHED_USER' as Username;

// ----------------------------- FILE DEFINITION ------------------------------

test('sayHello returns a hello message', async (): Promise<void> => {
    const message = 'Hello, Tester';

    execute.mockResolvedValueOnce(({
        outBinds: {
            message,
        },
    } as unknown) as Result<{ message: string }>);

    const result = await hello.sayHello(context, 'Tester');

    expect(result).toBe(message);
});

test('sayHello is able to handle DB errors', async (): Promise<void> => {
    const errorMessage = 'DB call failed';

    execute.mockRejectedValueOnce(new Error(errorMessage));

    let error = null;

    try {
        await hello.sayHello(context, 'Tester');
    } catch (err) {
        error = err;
    }

    expect(error).not.toBeNull();
    expect(error.message).toBe(errorMessage);
});
