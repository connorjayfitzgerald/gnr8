// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

/**
 * @see https://codemix.com/opaque-types-in-javascript/
 */
type Opaque<K, T> = T & { __TITLE__: K };

export type Username = Opaque<'Username', string>;
export type Password = Opaque<'Password', string>;
export type TrackingId = Opaque<'TrackingId', string>;

export type TracingFields = Record<string, any> & {
    moduleName: string;
};

// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface $TracingFields extends TracingFields {
    user: Username;
    trackingId: string;
    params: Record<string, any>;
    query: Record<string, any>;
}

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
            user: Username;
            startTime: Date;
            moduleName: string;
            trackingId: string;
            [key: string]: any;
        }

        /**
         * An extension to express.Response.
         */
        interface Response {
            timer: NodeJS.Timer;
        }
    }
}
