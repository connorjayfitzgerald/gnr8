// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

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
            user: string;
            startTime: Date;
        }

        /**
         * An extension to express.Response.
         */
        interface Response {
            timer: NodeJS.Timer;
        }
    }
}
