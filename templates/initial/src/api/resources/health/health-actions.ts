// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import { execute, Connection, assertRowsExists, usingConnection } from '../../../db';
import { logger } from '../../../utils';
import { $TracingFields } from '../../../types';

// -------------------------------- VARIABLES ---------------------------------

const healthQuery = 'SELECT 1 IS_HEALTHY FROM DUAL';

// ----------------------------- FILE DEFINITION ------------------------------

export const assertApiIsHealthy = async (tracing: $TracingFields): Promise<void> => {
    logger.debug(tracing, 'Performing health check');

    tracing.action = 'isApiHealthy';

    const impl = async (connection: Connection): Promise<void> => {
        const { rows } = assertRowsExists(await execute(connection, healthQuery));

        if (rows.length !== 1) {
            throw new Error('No rows returned from health check');
        }

        return;
    };

    await usingConnection(tracing, impl);

    return;
};
