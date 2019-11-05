// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import { execute, assertRowsExists } from '../../../db/db';
import { Context } from '../../../utils';

// -------------------------------- VARIABLES ---------------------------------

const healthQuery = 'SELECT 1 IS_HEALTHY FROM DUAL';

// ----------------------------- FILE DEFINITION ------------------------------

export const assertApiIsHealthy = async (context: Context): Promise<void> => {
    context.log.debug('Performing health check');

    const { rows } = assertRowsExists(await execute(context, healthQuery));

    if (rows.length !== 1) {
        throw new Error('No rows returned from health check');
    }

    return;
};
