// ------------------------------- NODE MODULES -------------------------------

import express, { Router } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';

// ------------------------------ CUSTOM MODULES ------------------------------

import { loadRouters } from './resources/load-routers';
import { appConfig } from '../config';
import { initialiseRequest, startTimer, notFound, errorHandler } from './middlewares';

// -------------------------------- VARIABLES ---------------------------------

const { base } = appConfig;

// ----------------------------- FILE DEFINITION ------------------------------

export const app = express();

app.use(helmet());

app.use(initialiseRequest);
app.use(startTimer);

app.use(bodyParser.json());

const router = Router();

loadRouters(router);

app.use(base, router);

// Return 404 if no routers not satisfied
app.use(notFound);

app.use(errorHandler);
