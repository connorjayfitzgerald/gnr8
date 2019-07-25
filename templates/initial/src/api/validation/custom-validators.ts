// ------------------------------- NODE MODULES -------------------------------

import { CustomValidator, Meta } from 'express-validator';

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

export const isValidParameter = (validParameters: string[]): CustomValidator => (value: string, meta: Meta): boolean =>
    validParameters.includes(meta.path);
