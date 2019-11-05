// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import { SayHelloPackage } from '../../../db/db';
import { Context } from '../../../utils';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const sayHello = async (context: Context, name: string): Promise<string> => {
    context.log.debug('Attempting to say hello');

    const message = await SayHelloPackage.SayHelloProcedure(context, { name });

    context.log.debug('Successfully said hello');

    return message;
};
