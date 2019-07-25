// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import { getPooledConnection, execute, closeConnection, Connection } from '../db';
import { logger } from '../utils';

// -------------------------------- VARIABLES ---------------------------------

const healthQuery = 'SELECT 1 IS_HEALTHY FROM DUAL';

// ----------------------------- FILE DEFINITION ------------------------------

export const isApiHealthy = async (username: string): Promise<boolean> => {
    let connection: Connection | null = null;

    try {
        logger.debug('Performing health check');

        connection = await getPooledConnection(username, 'health', 'isApiHealthy');

        const result = await execute(connection, healthQuery);

        await closeConnection(connection);

        const rows = result.rows as Record<string, any>[];

        logger.debug(
            {
                healthQuery,
                result: rows[0],
            },
            'Health check successful',
        );

        return true;
    } catch (err) {
        logger.error(err, 'Health check failed. API is unhealthy');

        await closeConnection(connection);

        return false;
    }
};
