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
import { OUT_FORMAT_OBJECT } from 'oracledb';
import { Username, Password, $TracingFields } from '../types';

oracledb.outFormat = OUT_FORMAT_OBJECT;
oracledb.extendedMetaData = true;

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger, CustomError } from '../utils';

// -------------------------------- VARIABLES ---------------------------------

import { dbConfig } from '../config';

// ----------------------------- FILE DEFINITION ------------------------------

export interface Connection extends BaseConnection {
    username: Username;
    id: string;
    heldSince: Date;
    executions: number;
    warningTimer: NodeJS.Timer;
    source: string;
}

export const getLobData = async <T>(tracing: $TracingFields, lob: Lob): Promise<T> => {
    logger.debug(tracing, 'Parsing lob data');

    const data = (await lob.getData()) as string;

    return JSON.parse(data);
};

interface GetUserConnectionOptions {
    newPassword?: string;
}

const initialiseConnection = (tracing: $TracingFields, connection: Connection): Connection => {
    const { user, moduleName, action, trackingId } = tracing;

    (connection.callTimeout = dbConfig.timeout * 1000), (connection.username = user);
    connection.clientId = user;
    connection.module = moduleName;
    connection.action = action;
    connection.id = trackingId;
    connection.heldSince = new Date();
    connection.executions = 0;
    connection.source = `${moduleName}.${action}`;
    connection.warningTimer = setInterval((): void => {
        const { username, id, heldSince, executions, source } = connection;
        const heldFor = new Date().getTime() - heldSince.getTime();

        logger.warn(
            {
                id,
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
    tracing: $TracingFields,
    username: Username,
    password: Password,
    options?: GetUserConnectionOptions,
): Promise<Connection> => {
    logger.debug({ ...tracing, username }, 'Obtaining user connection');

    const connectionAttrs: ConnectionAttributes = {
        connectionString: dbConfig.connection.string,
        user: username,
        password,
    };

    if (options && options.newPassword) {
        connectionAttrs.newPassword = options.newPassword;
    }

    const connection = (await oracledb.getConnection(connectionAttrs)) as Connection;

    initialiseConnection(tracing, connection);

    const { id, heldSince, source, executions } = connection;

    logger.trace({ ...tracing, id, username, heldSince, source, executions }, 'Connection successfully obtained');

    return connection;
};

export const getPooledConnection = async (tracing: $TracingFields): Promise<Connection> => {
    logger.trace(tracing, 'Obtaining connection from pool');

    const connection = (await oracledb.getConnection(dbConfig.pool.alias)) as Connection;

    initialiseConnection(tracing, connection);

    const { id, heldSince, source, executions } = connection;

    logger.trace(
        {
            ...tracing,
            id,
            heldSince,
            executions,
            source,
        },
        'Successfully obtained connection from pool',
    );

    return connection;
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
            pool._logStats();

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

export const closeConnection = async (tracing: $TracingFields, connection: Connection | null): Promise<void> => {
    if (!connection) return;

    const { username, id, warningTimer, heldSince, executions, source } = connection;

    const logAttrs = {
        ...tracing,
        id,
        username,
        heldSince,
        executions,
        source,
    };

    clearInterval(warningTimer);

    try {
        await connection.close();

        logger.trace(logAttrs, 'Connection successfully closed');
    } catch (err) {
        if (!err.message.includes('NJS-003')) {
            logger.error({ err, ...logAttrs }, 'Failed to close connection');
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
    tracing: $TracingFields,
    connection: Connection,
    sql: string,
    bindParams: BindParameters = {},
    options: CustomExecuteOptions = {},
): Promise<Result<T>> => {
    const { username, id, heldSince, executions, source } = connection;

    const logAttrs = {
        ...tracing,
        sql,
        bindParams,
        username,
        id,
        heldSince,
        heldFor: new Date().getTime() - heldSince.getTime(),
        executions,
        source,
    };

    const startTime = new Date();

    const logInterval = dbConfig.stats.execution.enabled
        ? setInterval(
              (): void =>
                  logger.debug(
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
            logger.debug(logAttrs, 'Executing SQL');
        }

        const result = await connection.execute<T>(sqlToExecute, bindVarsToExecute, options);

        connection.executions++;

        const { rowsAffected, rows } = result;

        logger.debug(
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
            await closeConnection(tracing, connection);
        }

        throw err;
    } finally {
        if (logInterval) clearInterval(logInterval);
    }
};

export const executeMany = async <T>(
    tracing: $TracingFields,
    connection: Connection,
    sql: string,
    binds: BindParameters[] = [],
    options: CustomExecuteOptions = {},
): Promise<Results<T>> => {
    const { id, username, heldSince, executions, source } = connection;

    const logAttrs = {
        ...tracing,
        sql,
        binds,
        id,
        username,
        heldSince,
        executions,
        source,
    };

    try {
        if (dbConfig.logging.logSql) {
            logger.debug(logAttrs, 'Bulk executing SQL');
        }

        const results = await connection.executeMany<T>(sql, binds, options);

        logger.debug(logAttrs, 'Bulk execution completed successfully');

        return results;
    } catch (err) {
        logger.error({ err, ...logAttrs }, 'Bulk execution failed');

        if (!(options.keepAlive && options.keepAlive === true)) {
            await closeConnection(tracing, connection);
        }

        throw err;
    }
};

export const getSequenceNextVal = async (
    tracing: $TracingFields,
    connection: Connection,
    sequenceName: string,
): Promise<number> => {
    interface OutBinds {
        seqVal: number;
    }

    const { rows } = await execute<OutBinds>(tracing, connection, `SELECT ${sequenceName}.NEXTVAL SEQ_VAL FROM DUAL`);

    if (rows) {
        return rows[0].seqVal;
    }

    throw new CustomError(`Unable to get next value for sequence ${sequenceName}`, 500);
};

type UseConnection<T> = (connection: Connection) => Promise<T>;

export const usingConnection = async <T>(
    tracing: $TracingFields,
    fn: UseConnection<T>,
    opts: {
        commit?: boolean;
        conn?: Connection;
    } = {},
): Promise<T> => {
    let connection = null;

    const { moduleName, action } = tracing;

    const keepAlive = opts.conn ? true : false;

    try {
        connection = opts.conn || (await getPooledConnection(tracing));

        const result = await fn(connection);

        if (opts.commit === true) {
            await connection.commit();
        }

        return result;
    } catch (err) {
        logger.error({ ...tracing, err }, `${moduleName}.${action} failed`);

        throw err;
    } finally {
        if (!keepAlive) {
            await closeConnection(tracing, connection);
        }
    }
};

interface ResultWithOutBinds<T> extends Result<T> {
    outBinds: T;
}

export const assertOutBindsExists = <T>(result: Result<T>): ResultWithOutBinds<T> => {
    if (!result.outBinds) {
        throw new Error(
            'outBinds was expected to exist but could not be found. Please contact GW, providing the log file',
        );
    }

    return result as ResultWithOutBinds<T>;
};

interface ResultWithRows<T> extends Result<T> {
    rows: T[];
}

export const assertRowsExists = <T>(result: Result<T>): ResultWithRows<T> => {
    if (!result.rows) {
        throw new Error('rows was expected to exist but could not be found. Please contact GW, providing the log file');
    }

    return result as ResultWithRows<T>;
};

export * from './packages';
