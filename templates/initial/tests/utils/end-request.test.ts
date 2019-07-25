// ------------------------------- NODE MODULES -------------------------------

import { Request, Response } from 'express';

// ------------------------------ CUSTOM MODULES ------------------------------

import { endRequest, endRequestWithFailure } from '../../src/utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

test('Response is not sent twice', async (): Promise<void> => {
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

    endRequest(req, res, 200);
    endRequestWithFailure(req, res, 200, []);

    expect(status).not.toHaveBeenCalled();
});
