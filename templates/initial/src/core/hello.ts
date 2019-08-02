// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import { getPooledConnection, closeConnection, SayHelloPackage } from '../db';
import { logger } from '../utils';

// -------------------------------- VARIABLES ---------------------------------

const moduleName = 'hello';

// ----------------------------- FILE DEFINITION ------------------------------

export const sayHello = async (username: string, name: string): Promise<string> => {
    const logAttrs = { name };

    logger.debug(logAttrs, 'Attempting to say hello');

    let connection = null;

    try {
        connection = await getPooledConnection(username, moduleName, 'sayHello');

        const message = await SayHelloPackage.SayHelloProcedure(connection, { name });

        logger.debug(logAttrs, 'Successfully said hello');

        return message;
    } catch (err) {
        logger.error(
            {
                err,
                ...logAttrs,
            },
            'Failed to say hello',
        );

        throw err;
    } finally {
        await closeConnection(connection);
    }
};
