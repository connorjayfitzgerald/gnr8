// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

import { helloWorld } from '../src/core';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

test('sayHello appends name', async (): Promise<void> => {
    const name = 'Connor';

    const message = await helloWorld.sayHello(name);

    expect(message).toEqual('Hello, Connor');
});

test('sayHello fails if name null', async (): Promise<void> => {
    const name = '';

    try {
        await helloWorld.sayHello(name);
    } catch (err) {
        expect(err).toBeDefined();
    }
});
