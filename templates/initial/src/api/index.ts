// ------------------------------- NODE MODULES -------------------------------

import express, { Router } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';

// ------------------------------ CUSTOM MODULES ------------------------------

import { loadRouters } from './routers/load-routers';
import { appConfig } from '../config';
import { initialiseRequest, startTimer, catchBadJson, notFound } from './middlewares';

// -------------------------------- VARIABLES ---------------------------------

const { base } = appConfig;

// ----------------------------- FILE DEFINITION ------------------------------

export const app = express();

const router = Router();

app.use(helmet());
app.use(startTimer);

app.use(base, router);

router.use(bodyParser.json());
router.use(catchBadJson);

router.use(initialiseRequest);

// Return 404 if no routers not satisfied
app.use(notFound);

loadRouters(router);
