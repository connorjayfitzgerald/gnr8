// ------------------------------- NODE MODULES -------------------------------

import { Request, Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { handleError } from '../../src/utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

test('Able to handle known and unknown ORA, DPI and NJS errors', (): void => {
    const req = {
        startTime: new Date(),
    } as Request;

    const status = jest.fn((): { send: jest.Mock } => ({
        send: jest.fn(),
    }));

    const res = ({
        timer: setTimeout((): null => null, 10000),
        headersSent: true, // Indicates response has been sent
        status,
    } as unknown) as Response;

    const errors = [
        new Error('ORA-01017: exists'),
        new Error('ORA-12345: doesnt exist'),
        new Error('DPI-1067: exists'),
        new Error('DPI-12345: doesnt exist'),
        new Error('NJS-040: exists'),
        new Error('NJS-12345: doesnt exist'),
    ];

    errors.forEach((err): Response => handleError(err, req, res));
});
