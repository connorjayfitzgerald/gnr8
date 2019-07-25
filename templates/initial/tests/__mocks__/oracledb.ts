// ------------------------------- NODE MODULES -------------------------------

import { Result, Connection, Pool } from 'oracledb';
import { Duplex } from 'stream';

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

export let connectionsInUse = 0;

// ----------------------------- FILE DEFINITION ------------------------------

export const createPool = jest.fn(
    (): Pool =>
        ({
            connectionsInUse,
            poolMax: 5,
            _logStats: (): void => {
                return;
            },
        } as Pool),
);

export const closeConnection = jest.fn(
    async (): Promise<void> => {
        connectionsInUse--;

        return;
    },
);

export const execute = jest.fn(
    async (): Promise<Result> => {
        return ({
            rows: [{ roleName: 'TEST' }],
        } as unknown) as Result;
    },
);

const connection: Connection = ({
    clientId: null,
    module: null,
    action: null,
    // username: null,
    execute,
    close: closeConnection,
} as unknown) as Connection;

export const getPoolMock = async (connectionsInUse: number, poolMax: number): Promise<Pool> => {
    return ({ connectionsInUse: connectionsInUse, poolMax: poolMax } as unknown) as Pool;
};

export default {
    outFormat: null,
    getConnection: async (): Promise<Connection> => {
        connectionsInUse++;
        return (connection as unknown) as Connection;
    },
    createPool,
};

export const getPooledConnection = jest.fn(
    async (): Promise<Connection> => {
        connectionsInUse++;
        return connection;
    },
);

export const createLob = (data: Record<string, any> | any[]): Duplex => {
    const lob = new Duplex();

    lob.push(JSON.stringify(data));
    lob.push(null);
    lob.setEncoding('utf8');

    return lob;
};
