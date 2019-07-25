// ------------------------------- NODE MODULES -------------------------------

import express, { Router } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';

// ------------------------------ CUSTOM MODULES ------------------------------

import { loadRouters } from './routers';
import { appConfig } from '../config';
import { initialiseRequest, timeoutMiddleware } from './middlewares';

// -------------------------------- VARIABLES ---------------------------------

const { base } = appConfig;

// ----------------------------- FILE DEFINITION ------------------------------

export const app = express();

const router = Router();

app.use(helmet());
app.use(timeoutMiddleware);

app.use(base, router);

router.use(bodyParser.json());
router.use(initialiseRequest);

loadRouters(router);
