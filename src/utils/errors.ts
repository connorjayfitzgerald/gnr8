// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export class CustomError extends Error {
    /** HTTP Status Code */
    public status: number;

    public constructor(message: string, status: number) {
        super(message);

        this.status = status;
    }
}

export class ErrorList {
    public errors: Error[];
    public status: number;

    public constructor(errors: Error[], status: number) {
        this.errors = errors;
        this.status = status;
    }
}
