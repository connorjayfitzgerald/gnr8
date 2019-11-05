// ------------------------------- NODE MODULES -------------------------------

import oracledb, {
    Lob,
    ConnectionAttributes,
    Results,
    Pool,
    ExecuteOptions,
    Result,
    BindParameters,
    Connection as BaseConnection,
} from 'oracledb';
import { OUT_FORMAT_OBJECT, POOL_STATUS_CLOSED } from 'oracledb';
import { Username, Password } from '../types';

oracledb.outFormat = OUT_FORMAT_OBJECT;
oracledb.extendedMetaData = true;

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger, CustomError, Context } from '../utils';

// -------------------------------- VARIABLES ---------------------------------

import { dbConfig } from '../config';

// ----------------------------- FILE DEFINITION ------------------------------

export interface Connection extends BaseConnection {
    heldSince: Date;
    executions: number;
    warningTimer: NodeJS.Timer;
    source: string;
}

export const getLobData = async <T>(context: Context, lob: Lob): Promise<T> => {
    context.log.debug('Parsing lob data');

    const data = (await lob.getData()) as string;

    return JSON.parse(data);
};

interface GetUserConnectionOptions {
    newPassword?: string;
}

const initialiseConnection = (context: Context, connection: Connection, usernameOverride?: Username): Connection => {
    const { moduleName, trackingId } = context;

    const username = usernameOverride || context.username;

    connection.callTimeout = dbConfig.timeout * 1000;
    connection.clientId = username;
    connection.module = moduleName;
    connection.action = trackingId;
    connection.heldSince = new Date();
    connection.executions = 0;
    connection.warningTimer = setInterval((): void => {
        const { heldSince, executions, source } = connection;
        const heldFor = new Date().getTime() - heldSince.getTime();

        context.log.warn(
            {
                username,
                heldSince,
                heldFor,
                executions,
                source,
            },
            `Connection has been held for ${(heldFor / 1000).toFixed(
                0,
            )} seconds. This may indicate connection cleanup has failed. Please provide Griffiths Waite with this log file for assistance`,
        );
    }, 120000); // 2 minutes

    return connection;
};

export const getUserConnection = async (
    context: Context,
    username: Username,
    password: Password,
    options?: GetUserConnectionOptions,
): Promise<Connection> => {
    context.log.debug({ connectionUser: username }, 'Obtaining user connection');

    const connectionAttrs: ConnectionAttributes = {
        connectionString: dbConfig.connection.string,
        user: username,
        password,
    };

    if (options && options.newPassword) {
        connectionAttrs.newPassword = options.newPassword;
    }

    const connection = (await oracledb.getConnection(connectionAttrs)) as Connection;

    initialiseConnection(context, connection, username);

    const { heldSince, source, executions } = connection;

    context.log.trace({ connectionUser: username, heldSince, source, executions }, 'Connection successfully obtained');

    return connection;
};

export const getPooledConnection = async (context: Context): Promise<Connection> => {
    context.log.trace('Obtaining connection from pool');

    const connection = (await oracledb.getConnection(dbConfig.pool.alias)) as Connection;

    initialiseConnection(context, connection);

    context.connection = connection;

    const { heldSince, source, executions } = connection;

    context.log.trace(
        {
            heldSince,
            executions,
            source,
        },
        'Successfully obtained connection from pool',
    );

    return connection;
};

export interface PoolStats {
    statistics: {
        maxQueueLength: number;
        minTimeInQueue: number;
        maxTimeInQueue: number;
        averageTimeInQueue: number;
        connectionsInUse: number;
        connectionsOpen: number;
    };
    totals: {
        upTime: number;
        connectionRequests: number;
        requestsEnqueued: number;
        requestsDequeued: number;
        failedRequests: number;
        requestTimeouts: number;
        timeInQueue: number;
    };
    attributes: {
        alias?: string;
        status: number;
        queueTimeout: number;
        minConnections: number;
        maxConnections: number;
        increment: number;
        timeout: number;
        pingInterval: number;
        sessionCallback: string;
        stmtCacheSize: number;
        threadpoolSize: number;
    };
}

export const getPoolStats = async (poolAlias: string): Promise<PoolStats> => {
    const pool = (await oracledb.getPool(poolAlias)) as any;

    if (!pool) {
        throw new Error(`No pool exists with alias ${poolAlias}`);
    }

    if (pool.status === POOL_STATUS_CLOSED) {
        throw new Error('Unable to get statistics from a closed connection pool');
    }

    if (pool._enableStats !== true) {
        throw new Error('Pool statistics disabled');
    }

    let averageTimeInQueue = 0;

    if (pool._totalRequestsEnqueued !== 0) {
        averageTimeInQueue = Math.round(pool._totalTimeInQueue / pool._totalRequestsEnqueued);
    }

    let sessionCallback = pool.sessionCallback;

    switch (typeof pool.sessionCallback) {
        case 'function':
            sessionCallback = pool.sessionCallback.name;
            break;
        case 'string':
            sessionCallback = '"' + pool.sessionCallback + '"';
            break;
    }

    return {
        statistics: {
            maxQueueLength: pool._maxQueueLength,
            minTimeInQueue: pool._minTimeInQueue,
            maxTimeInQueue: pool._maxTimeInQueue,
            averageTimeInQueue,
            connectionsInUse: pool.connectionsInUse,
            connectionsOpen: pool.connectionsOpen,
        },
        totals: {
            upTime: Date.now() - pool._createdDate,
            connectionRequests: pool._totalConnectionRequests,
            requestsEnqueued: pool._totalRequestsEnqueued,
            requestsDequeued: pool._totalRequestsDequeued,
            failedRequests: pool._totalFailedRequests,
            requestTimeouts: pool._totalRequestTimeouts,
            timeInQueue: pool._totalTimeInQueue,
        },
        attributes: {
            alias: pool.poolAlias,
            status: pool.status,
            queueTimeout: pool.queueTimeout,
            minConnections: pool.poolMin,
            maxConnections: pool.poolMax,
            increment: pool.poolIncrement,
            timeout: pool.poolTimeout,
            pingInterval: pool.poolPingInterval,
            sessionCallback,
            stmtCacheSize: pool.stmtCacheSize,
            threadpoolSize: parseInt(process.env.UV_THREADPOOL_SIZE || '-1'),
        },
    };
};

export const createPool = async (): Promise<Pool> => {
    const { alias: poolAlias } = dbConfig.pool;

    logger.debug({ poolAlias }, 'Creating connection pool');

    const _enableStats = dbConfig.stats.pool.enabled;

    const pool = await oracledb.createPool({
        connectionString: dbConfig.connection.string,
        password: dbConfig.connection.password,
        user: dbConfig.connection.user,
        poolAlias: dbConfig.pool.alias,
        poolMax: dbConfig.pool.max,
        poolMin: dbConfig.pool.min,
        _enableStats,
        stmtCacheSize: 0,
    });

    if (_enableStats) {
        setInterval((): void => {
            getPoolStats(dbConfig.pool.alias)
                .then((stats): void => logger.debug(stats, 'Connection pool statistics'))
                .catch((err): void => logger.error({ err }, 'Unable to determine pool statistics'));

            if (pool.connectionsInUse === pool.poolMax) {
                logger.warn(`All ${pool.connectionsInUse} connections are currently in use`);
            } else if (pool.poolMax >= 10 && pool.connectionsInUse >= pool.poolMax * 0.85) {
                logger.warn(`${pool.connectionsInUse} connections of a possible ${pool.poolMax} are currently in use`);
            }
        }, dbConfig.stats.pool.interval * 1000);
    }

    logger.debug({ poolAlias }, 'Successfully created connection pool');

    return pool;
};

export const closeConnection = async (context: Context, connection?: Connection): Promise<void> => {
    if (!connection) return;

    const { warningTimer, heldSince, executions, source } = connection;

    const logAttrs = {
        heldSince,
        executions,
        source,
    };

    clearInterval(warningTimer);

    try {
        await connection.close();

        context.log.trace(logAttrs, 'Connection successfully closed');
    } catch (err) {
        if (!err.message.includes('NJS-003')) {
            context.log.error({ err, ...logAttrs }, 'Failed to close connection');
        }
    }

    return;
};

interface CustomExecuteOptions extends ExecuteOptions {
    /**
     * By default, if an error occurs the connection will closed. Setting this to true will disable this behavior.
     *
     * @default false
     */
    keepAlive?: boolean;
    /**
     * By default, returnText will be thrown as an error if returnCode is populated. Setting this to true will disable the
     * returnCode check.
     *
     * @default false
     */
    skipReturnCodeCheck?: boolean;
    limit?: number;
    offset?: number;
}

export const execute = async <T>(
    context: Context,
    sql: string,
    bindParams: BindParameters = {},
    options: CustomExecuteOptions = {},
): Promise<Result<T>> => {
    const connection = context.connection || (await getPooledConnection(context));

    const { heldSince, executions, source } = connection;

    const logAttrs = {
        sql,
        bindParams,
        heldSince,
        heldFor: new Date().getTime() - heldSince.getTime(),
        executions,
        source,
    };

    const startTime = new Date();

    const logInterval = dbConfig.stats.execution.enabled
        ? setInterval(
              (): void =>
                  context.log.debug(
                      { ...logAttrs, duration: new Date().getTime() - startTime.getTime() },
                      'Execution still in progress',
                  ),
              dbConfig.stats.execution.interval * 1000,
          )
        : null;

    try {
        let sqlToExecute = sql;
        const bindVarsToExecute: Record<string, any> = { ...bindParams };

        if (options.limit && options.limit >= 0) {
            const upperSql = sql.trim().toUpperCase();

            if (upperSql.startsWith('SELECT') || upperSql.startsWith('WITH')) {
                sqlToExecute += ' OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY';
                bindVarsToExecute.limit = options.limit;
                bindVarsToExecute.offset = options.offset || 0;

                logAttrs.sql = sqlToExecute;
                logAttrs.bindParams = bindVarsToExecute;
            }
        }

        if (dbConfig.logging.logSql) {
            context.log.debug(logAttrs, 'Executing SQL');
        }

        const result = await connection.execute<T>(sqlToExecute, bindVarsToExecute, options);

        connection.executions++;

        const { rowsAffected, rows } = result;

        context.log.debug(
            {
                ...logAttrs,
                rowsAffected,
                rowsLength: rows ? rows.length : 0,
                duration: new Date().getTime() - startTime.getTime(),
            },
            'Execution complete',
        );

        return result;
    } catch (err) {
        if (!(options.keepAlive && options.keepAlive === true)) {
            await closeConnection(context, connection);
        }

        throw err;
    } finally {
        if (logInterval) clearInterval(logInterval);
    }
};

export const executeMany = async <T>(
    context: Context,
    sql: string,
    binds: BindParameters[] = [],
    options: CustomExecuteOptions = {},
): Promise<Results<T>> => {
    const connection = context.connection || (await getPooledConnection(context));

    const { heldSince, executions, source } = connection;

    const logAttrs = {
        sql,
        binds,
        heldSince,
        executions,
        source,
    };

    try {
        if (dbConfig.logging.logSql) {
            context.log.debug(logAttrs, 'Bulk executing SQL');
        }

        const results = await connection.executeMany<T>(sql, binds, options);

        context.log.debug(logAttrs, 'Bulk execution completed successfully');

        return results;
    } catch (err) {
        context.log.error({ err, ...logAttrs }, 'Bulk execution failed');

        if (!(options.keepAlive && options.keepAlive === true)) {
            await closeConnection(context, connection);
        }

        throw err;
    }
};

export const getSequenceNextVal = async (context: Context, sequenceName: string): Promise<number> => {
    interface OutBinds {
        seqVal: number;
    }

    const { rows } = await execute<OutBinds>(context, `SELECT ${sequenceName}.NEXTVAL SEQ_VAL FROM DUAL`);

    if (rows) {
        return rows[0].seqVal;
    }

    throw new CustomError(`Unable to get next value for sequence ${sequenceName}`, 500);
};

interface ResultWithOutBinds<T> extends Result<T> {
    outBinds: T;
}

export const assertOutBindsExists = <T>(result: Result<T>): ResultWithOutBinds<T> => {
    if (!result.outBinds) {
        throw new Error('outBinds was expected to exist but could not be found');
    }

    return result as ResultWithOutBinds<T>;
};

interface ResultWithRows<T> extends Result<T> {
    rows: T[];
}

export const assertRowsExists = <T>(result: Result<T>): ResultWithRows<T> => {
    if (!result.rows) {
        throw new Error('rows was expected to exist but could not be found');
    }

    return result as ResultWithRows<T>;
};

export * from './packages';
