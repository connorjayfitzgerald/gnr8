// ------------------------------- NODE MODULES -------------------------------

import oracledb, { Pool, ExecuteOptions, Result, BindParameters, Connection as BaseConnection, OBJECT } from 'oracledb';

import { Readable } from 'stream';

oracledb.outFormat = OBJECT;
oracledb.extendedMetaData = true;

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger } from '../utils';

// -------------------------------- VARIABLES ---------------------------------

import { dbConfig, appConfig } from '../config';

// ----------------------------- FILE DEFINITION ------------------------------

export interface Connection extends BaseConnection {
    username: string;
    timer: NodeJS.Timer;
}

export const getUserConnection = async (
    username: string,
    password: string,
    moduleName: string,
    action: string,
): Promise<Connection> => {
    logger.debug({ username }, 'Obtaining user connection');

    const connection = await oracledb.getConnection({
        connectionString: dbConfig.connection.string,
        user: username,
        password,
    });

    connection.clientId = username;
    connection.module = moduleName;
    connection.action = action;

    logger.trace({ username }, 'Connection successfully obtained');

    return Object.defineProperty(connection, 'username', {
        value: username,
        writable: false,
    });
};

export const createPool = async (): Promise<Pool> => {
    logger.debug({ poolAlias: dbConfig.pool.alias }, 'Creating connection pool');

    const _enableStats = dbConfig.stats.enabled;

    const pool = await oracledb.createPool({
        connectionString: dbConfig.connection.string,
        password: dbConfig.connection.password,
        user: dbConfig.connection.user,
        poolAlias: dbConfig.pool.alias,
        poolMax: dbConfig.pool.max,
        poolMin: dbConfig.pool.min,
        poolIncrement: dbConfig.pool.increment,
        _enableStats,
        stmtCacheSize: 0,
    });

    if (_enableStats) {
        setInterval((): void => {
            pool._logStats();

            if (pool.connectionsInUse === pool.poolMax) {
                logger.warn(`All ${pool.connectionsInUse} connections are currently in use`);
            } else if (pool.poolMax >= 10 && pool.connectionsInUse >= pool.poolMax * 0.85) {
                logger.warn(`${pool.connectionsInUse} connections of a possible ${pool.poolMax} are currently in use`);
            }
        }, dbConfig.stats.interval * 1000);
    }

    logger.debug(
        {
            poolAlias: dbConfig.pool.alias,
        },
        'Successfully created connection pool',
    );

    return pool;
};

export const closeConnection = async (connection: Connection | null): Promise<void> => {
    if (!connection) return;

    try {
        clearTimeout(connection.timer);

        await connection.close();

        logger.trace({ username: connection.username }, 'Connection successfully closed');
    } catch (err) {
        if (!err.message.includes('NJS-003')) {
            logger.error({ err, username: connection.username }, 'Failed to close connection');
        }
    }

    return;
};

export const getPooledConnection = async (
    username: string,
    moduleName: string,
    action: string,
): Promise<Connection> => {
    const logAttrs = {
        poolAlias: dbConfig.pool.alias,
        username,
    };

    logger.trace(logAttrs, 'Obtaining connection from pool');

    const connection = (await oracledb.getConnection(dbConfig.pool.alias)) as Connection;

    connection.clientId = username;
    connection.module = moduleName;
    connection.action = action;

    connection.timer = setTimeout(async (): Promise<void> => {
        logger.debug(
            {
                username,
                moduleName,
                action,
            },
            'Timeout exceeded. Attempting to break connection',
        );

        try {
            await connection.break();
        } catch (err) {}

        await closeConnection(connection);
    }, appConfig.timeout * 1000);

    logger.trace(logAttrs, 'Successfully obtained connection from pool');

    return Object.defineProperty(connection, 'username', {
        value: username,
        writable: false,
    });
};

interface CustomExecuteOptions extends ExecuteOptions {
    /**
     * By default, if an error occurs the connection will closed. Setting this to true will disable this behavior.
     *
     * @default false
     */
    keepAlive?: boolean;
}

export const parseLob = (lob: Readable): Promise<Record<string, any> | any[]> =>
    new Promise((resolve, reject): void => {
        lob.setEncoding('utf8');

        let result = '';

        lob.on('error', (err: Error): void => {
            logger.error(err, 'Failed to parse lob');

            return reject(err);
        })
            .on('end', (): void => {
                logger.debug('Succesfully parsed lob');

                return resolve(JSON.parse(result));
            })
            .on('data', (chunk: string): void => {
                result += chunk;
            });
    });

export const execute = async (
    connection: Connection,
    sql: string,
    bindParams: BindParameters = {},
    options: CustomExecuteOptions = {},
): Promise<Result> => {
    const logAttrs = dbConfig.logging.logQueries
        ? {
              sql,
              bindParams,
              username: connection.username,
          }
        : { username: connection.username };

    try {
        logger.debug(logAttrs, 'Executing SQL');

        const result = await connection.execute(sql, bindParams, options);

        const outBinds: Record<string, any> = result.outBinds;

        if (outBinds && outBinds.errorCode) {
            const { errorCode, errorMessage, errorIndicator, errorIdentifier, errorLevel } = outBinds;

            logger.error(
                {
                    errorCode,
                    errorMessage,
                    errorIndicator,
                    errorIdentifier,
                    errorLevel,
                },
                'An error occurred executing SQL',
            );

            throw new Error(errorMessage);
        }

        return result;
    } catch (err) {
        if (!(options.keepAlive && options.keepAlive === true)) {
            await closeConnection(connection);
        }

        throw err;
    }
};

export * from './packages';
