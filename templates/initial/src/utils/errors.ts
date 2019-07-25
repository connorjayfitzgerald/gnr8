// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import { defaultError } from './error-handler';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export class CustomError extends Error {
    /** HTTP Status Code */
    public status: number;
    public code?: number;

    public constructor(message: string, status: number) {
        super(message);

        this.status = status;
    }
}

export const oraErrors: Record<string, CustomError> = {
    'ORA-01017': new CustomError('Invalid username or password', 401),
    'ORA-28000': new CustomError('Your account has been locked', 403),
    'ORA-28001': new CustomError('Your password has expired', 401),
    'ORA-06550': new CustomError(defaultError, 500),
    'DPI-1067': new CustomError('Request timed out.', 408), // Error code for execute timeout
    'NJS-040': new CustomError('System busy. Please try again later.', 503), // Error code for queue timeout obtaining connection
};
