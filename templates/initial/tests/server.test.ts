// ------------------------------- NODE MODULES -------------------------------

import { Pool } from 'oracledb';

// ------------------------------ CUSTOM MODULES ------------------------------

import { createPool } from '../src/db';
import { createPool as createPoolMock } from './__mocks__/oracledb';
import { logger } from '../src/utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

beforeEach((): void => {
    jest.resetModules();
});

test('API fails to start if environment variables are missing', async (): Promise<void> => {
    process.env.API_PORT = '';

    let error = null;

    try {
        await import('../src/config');
    } catch (err) {
        error = err;
    }

    expect(error).not.toBeNull();
});

test('API defaults set correctly if not provided', async (): Promise<void> => {
    process.env = { ...process.env, API_BASE: '', API_PORT: '3000', LOG_LEVEL: '', LOG_PRETTY: '' };

    const { logger } = await import('../src/utils/logger');

    expect(logger.level).toBe('debug');
});

const wait = (seconds: number): Promise<void> =>
    new Promise((resolve): void => {
        setTimeout(resolve, seconds * 1000);
    });

test('API successfully creates connection pool and starts', async (): Promise<void> => {
    process.env = { ...process.env, DB_ENABLE_STATS: 'true', DB_STATS_INTERVAL: '2' };

    await import('../src/config');

    await createPool();

    await wait(3);
});

test('DB pool logs warnings if all connections are in use', async (): Promise<void> => {
    const warnSpy = jest.spyOn(logger, 'warn');

    createPoolMock.mockReturnValueOnce(({
        connectionsInUse: 5,
        poolMax: 5,
        _logStats: (): null => null,
    } as unknown) as Pool);

    await import('../src/config');

    await createPool();

    await wait(3);

    expect(warnSpy).toHaveBeenCalled();
});

test('DB pool logs warnings if the majority of connections are in use', async (): Promise<void> => {
    const warnSpy = jest.spyOn(logger, 'warn');

    createPoolMock.mockReturnValueOnce(({
        connectionsInUse: 46,
        poolMax: 50,
        _logStats: (): null => null,
    } as unknown) as Pool);

    await import('../src/config');

    await createPool();

    await wait(3);

    expect(warnSpy).toHaveBeenCalled();
});
