// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import {
    execute,
    getLobData,
    getUserConnection,
    assertRowsExists,
    assertOutBindsExists,
    getSequenceNextVal,
} from '../src/db/db';
import { Context } from '../src/utils';
import { Username, Password } from '../src/types';
import { execute as mockedExecute, createLob } from './__mocks__/oracledb';

// -------------------------------- VARIABLES ---------------------------------

const context = new Context();

// ----------------------------- FILE DEFINITION ------------------------------

test('getLobData is able to parse JSON string', async (): Promise<void> => {
    const fakeData = {
        json: 'test',
        number: 5,
        date: new Date().toISOString(),
        obj: {
            array: [1, 2, 3],
        },
        objArray: [
            {
                test: '1234',
            },
        ],
    };

    const fakeLob = createLob(JSON.stringify(fakeData));

    const lobData = await getLobData(context, fakeLob);

    expect(lobData).toEqual(fakeData);
});

test('getUserConnection is able to get a connection', async (): Promise<void> => {
    const connection = await getUserConnection(context, 'fakeuser' as Username, 'fakepassword' as Password, {
        newPassword: 'fakenewpassword',
    });

    expect(connection.execute).toBeDefined();
});

test('assertRowsExists errors if no rows exist', async (): Promise<void> => {
    mockedExecute.mockResolvedValueOnce({
        rows: undefined,
    });

    const result = await execute(context, 'fakesql', {});

    expect(() => assertRowsExists(result)).toThrow();
});

test('assertOutBindsExists errors if no rows exist', async (): Promise<void> => {
    mockedExecute.mockResolvedValueOnce({
        outBinds: undefined,
    });

    const result = await execute(context, 'fakesql', {});

    expect(() => assertOutBindsExists(result)).toThrow();
});

test('getSequenceNexVal successful if returned', async (): Promise<void> => {
    mockedExecute.mockResolvedValueOnce({
        rows: [
            {
                seqVal: 123456,
            },
        ],
    });

    await expect(getSequenceNextVal(context, 'fake_seq')).resolves.toBe(123456);
});

test('getSequenceNexVal errors if no val returned', async (): Promise<void> => {
    mockedExecute.mockResolvedValueOnce({
        rows: [],
    });

    await expect(getSequenceNextVal(context, 'fake_seq')).rejects.toBeDefined();
});
