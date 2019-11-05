// ------------------------------- NODE MODULES -------------------------------

import { BIND_OUT } from 'oracledb';

// ------------------------------ CUSTOM MODULES ------------------------------

import { execute, assertOutBindsExists } from '../db';
import { Context } from '../../utils';

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
    SayHelloProcedure: async (context: Context, params: SayHelloPackage.SayHelloProcedureParams): Promise<string> => {
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

        const {
            outBinds: { message },
        } = assertOutBindsExists(await execute<SayHelloPackage.SayHelloProcedureOutBinds>(context, sql, bindParams));

        return message;
    },
};
