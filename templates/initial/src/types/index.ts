// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import { Context } from '../utils/Context';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

/**
 * @see https://codemix.com/opaque-types-in-javascript/
 */
type Opaque<K, T> = T & { __TITLE__: K };

export type Username = Opaque<'Username', string>;
export type Password = Opaque<'Password', string>;
export type TrackingId = Opaque<'TrackingId', string>;

/**
 * This error structure has been taken from the JSON API standard.
 *
 * @see https://jsonapi.org/format/#error-objects
 */
export interface CommonError {
    id?: string;
    links?: {
        about: string;
    };
    status?: string;
    code?: string;
    title?: string;
    detail: string;
    source?: {
        pointer?: string;
        parameter?: string;
    };
    meta?: Record<string, any>;
}

declare global {
    namespace Express {
        /**
         * An extension to express.Request.
         */
        interface Request {
            context: Context;
        }

        /**
         * An extension to express.Response.
         */
        interface Response {
            timer: NodeJS.Timer;
        }
    }
}
