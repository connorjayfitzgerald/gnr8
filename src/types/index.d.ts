// ------------------------------- NODE MODULES -------------------------------

import * as OracleDB from 'oracledb';

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export interface Connection extends OracleDB.Connection {
    username: string;
}
