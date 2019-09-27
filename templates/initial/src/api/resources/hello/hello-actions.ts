// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import { SayHelloPackage, usingConnection, Connection } from '../../../db';
import { logger } from '../../../utils';
import { $TracingFields } from '../../../types';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const sayHello = async (tracing: $TracingFields, name: string): Promise<string> => {
    tracing.action = 'sayHello';

    logger.debug(tracing, 'Attempting to say hello');

    const impl = async (connection: Connection): Promise<string> =>
        await SayHelloPackage.SayHelloProcedure(tracing, connection, { name });

    const message = await usingConnection(tracing, impl);

    logger.debug(tracing, 'Successfully said hello');

    return message;
};
