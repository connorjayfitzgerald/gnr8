// ------------------------------- NODE MODULES -------------------------------

import OracleDB, { Pool, BindParametersObject, ExecuteOptions, Result } from 'oracledb';
import { Connection } from '../types';

// ------------------------------ CUSTOM MODULES ------------------------------

import { camelise, logger } from '../utils';

// -------------------------------- VARIABLES ---------------------------------

const {
    DB_CONNECTION_STRING,
    DB_PASSWORD,
    DB_POOL_ALIAS,
    DB_POOL_MAX,
    DB_POOL_MIN,
    DB_STATS_ENABLED,
    DB_STATS_INTERVAL,
    DB_USER,
} = process.env;

// ----------------------------- FILE DEFINITION ------------------------------

if (
    DB_CONNECTION_STRING === undefined ||
    DB_PASSWORD === undefined ||
    DB_POOL_ALIAS === undefined ||
    DB_POOL_MAX === undefined ||
    DB_POOL_MIN === undefined ||
    DB_STATS_ENABLED === undefined ||
    DB_STATS_INTERVAL === undefined ||
    DB_USER === undefined
) {
    throw new Error('DB credentials must be configured');
}

export const getUserConnection = async (username: string, password: string): Promise<Connection> => {
    logger.debug(`Obtaining connection for user ${username}`);

    const connection = await OracleDB.getConnection({
        connectionString: DB_CONNECTION_STRING,
        user: username,
        password,
    });

    logger.debug(`Successfully obtained connection for user ${username}`);

    return Object.defineProperty(connection, 'username', {
        value: username,
        writable: false,
    });
};

export const getPooledConnection = async (
    username: string,
    moduleName: string,
    action: string,
): Promise<Connection> => {
    logger.debug(`Obtaining connection from pool ${DB_POOL_ALIAS} for user ${username}`);

    const connection = await OracleDB.getConnection(DB_POOL_ALIAS);

    connection.clientId = username;
    connection.module = moduleName;
    connection.action = action;

    logger.debug(`Successfully obtained connection from pool ${DB_POOL_ALIAS} for user ${username}`);

    return Object.defineProperty(connection, 'username', {
        value: username,
        writable: false,
    });
};

export const createPool = async (): Promise<Pool> => {
    logger.debug(`Creating connection pool with alias ${DB_POOL_ALIAS}`);

    const _enableStats = DB_STATS_ENABLED.toLowerCase() === 'true';

    const pool = await OracleDB.createPool({
        connectionString: DB_CONNECTION_STRING,
        password: DB_PASSWORD,
        user: DB_USER,
        poolAlias: DB_POOL_ALIAS,
        poolMax: Number(DB_POOL_MAX),
        poolMin: Number(DB_POOL_MIN),
        _enableStats,
        stmtCacheSize: 0,
    });

    if (_enableStats) {
        setInterval((): void => {
            if (pool.connectionsInUse === pool.poolMax) {
                logger.warn(`All ${pool.connectionsInUse} connections are currently in use`);
            } else if (pool.poolMax >= 10 && pool.connectionsInUse >= pool.poolMax * 0.85) {
                logger.warn(`${pool.connectionsInUse} connections of a possible ${pool.poolMax} are currently in use`);
            }
        }, Number(DB_STATS_INTERVAL) * 1000);
    }

    logger.debug(`Successfully created connection pool with alias ${DB_POOL_ALIAS}`);

    return pool;
};

export const closeConnection = async (connection: Connection): Promise<void> => {
    try {
        await connection.close();

        logger.debug(`Successfully closed connection for user ${connection.username}`);
    } catch (err) {
        logger.error(err, `Failed to close connection for user ${connection.username}`);
    }

    return;
};

interface BPSExecuteOptions extends ExecuteOptions {
    /**
     * By default, if an error occurs the connection will closed. Setting this to true will disable this behavior.
     *
     * @default false
     */
    keepAlive?: boolean;
}

export const execute = async (
    connection: Connection,
    sql: string,
    bindParams: BindParametersObject | any[] = {},
    options: BPSExecuteOptions = {},
): Promise<Result> => {
    try {
        logger.debug(
            {
                sql,
                bindParams,
            },
            `Executing SQL for ${connection.username}`,
        );

        const result = await connection.execute(sql, bindParams, options);

        result.rows = camelise(result.rows);

        if (result.outBinds) {
            const outBinds: Record<string, any> = result.outBinds;

            if (outBinds.returnCode) {
                throw new Error(outBinds.returnText);
            }
        }

        return result;
    } catch (err) {
        if (!(options.keepAlive && options.keepAlive === true)) {
            await closeConnection(connection);
        }

        throw err;
    }
};
