// ------------------------------- NODE MODULES -------------------------------

import { Logger } from 'pino';
import uuid from 'uuid/v4';

// ------------------------------ CUSTOM MODULES ------------------------------

import { logger } from './logger';
import { Username } from '../types';
import { Connection } from '../db/db';

// -------------------------------- VARIABLES ---------------------------------

const fixedAttributes = {
    // Add here any attributes we want on every log statement
};

// ----------------------------- FILE DEFINITION ------------------------------

export class Context {
    public log: Logger;
    public startTime: Date = new Date();
    public trackingId: string = uuid();
    public moduleName?: string;
    public connection?: Connection;
    private _username: Username;

    public constructor() {
        this._username = 'NOT_AUTHENTICATED' as Username;

        this.log = logger.child({ trackingId: this.trackingId, ...fixedAttributes });
    }

    public addLogAttributes(attributes: Record<string, any>): void {
        this.log = this.log.child(attributes);
    }

    public set username(username: Username) {
        this._username = username;

        // Update the context logger with the new username
        this.log = this.log.child({ username: this._username });
    }

    public get username(): Username {
        return this._username;
    }
}
