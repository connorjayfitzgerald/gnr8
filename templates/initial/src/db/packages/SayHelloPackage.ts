// ------------------------------- NODE MODULES -------------------------------

import { BIND_OUT } from 'oracledb';

// ------------------------------ CUSTOM MODULES ------------------------------

import { Connection, execute, assertOutBindsExists } from '..';
import { $TracingFields } from '../../types';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export namespace SayHelloPackage {
    export interface SayHelloProcedureParams {
        name: string;
    }

    export interface SayHelloProcedureOutBinds {
        message: string;
    }
}

export const SayHelloPackage = {
    SayHelloProcedure: async (
        tracing: $TracingFields,
        connection: Connection,
        params: SayHelloPackage.SayHelloProcedureParams,
    ): Promise<string> => {
        const { name } = params;

        const sql = `   BEGIN
                            SELECT
                                'Hello, ' || :name
                            INTO :message
                            FROM DUAL;
                        END;`;

        const bindParams = {
            name,
            message: { dir: BIND_OUT },
        };

        const { outBinds } = assertOutBindsExists(
            await execute<SayHelloPackage.SayHelloProcedureOutBinds>(tracing, connection, sql, bindParams),
        );

        return outBinds.message;
    },
};
