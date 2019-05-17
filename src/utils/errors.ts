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

export const errors = {
    nameUndefined: new CustomError('Name must be provided to say hello!', 400),
};
