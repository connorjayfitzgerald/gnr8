// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger, CustomError } from '../utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const sayHello = async (name: string): Promise<string> => {
    logger.debug({ name }, 'Saying hello');

    if (!name) {
        throw new CustomError('Name must be provided to say hello!', 400);
    }

    return `Hello, ${name}`;
};
