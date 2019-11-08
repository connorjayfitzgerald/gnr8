// ------------------------------- NODE MODULES -------------------------------

import { register, collectDefaultMetrics } from 'prom-client';

// ------------------------------ CUSTOM MODULES ------------------------------

import { appConfig } from '../config';
import { logger } from '.';

// -------------------------------- VARIABLES ---------------------------------

const { metrics } = appConfig;

// ----------------------------- FILE DEFINITION ------------------------------

export const getMetrics = (): object | void => {
    if (metrics.enabled) {
        return register.getMetricsAsJSON();
    }

    return;
};

if (metrics.enabled) {
    logger.info(
        `Application metrics will be collected every ${metrics.collectInterval} seconds and logged every ${metrics.logInterval} seconds`,
    );

    collectDefaultMetrics({ timeout: metrics.collectInterval * 1000 });

    setInterval((): void => {
        logger.debug({ metrics: getMetrics() });
    }, metrics.logInterval * 1000);
} else {
    logger.warn('Application metrics disabled');
}
