// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger, errors } from '../utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const sayHello = async (name: string): Promise<string> => {
    logger.debug({ name }, 'Saying hello');

    if (!name) {
        throw errors.nameUndefined;
    }

    return `Hello, ${name}`;
};
