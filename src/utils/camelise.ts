/* eslint @typescript-eslint/no-use-before-define: 0 */

// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const cameliseString = (input: string, delimiter: string = '_'): string => {
    const splitInput = input.split(delimiter);

    return splitInput
        .map(
            (word: string, index: number): string => {
                if (index === 0) return word.toLowerCase();

                const lower = word.toLowerCase();

                return `${lower.charAt(0).toUpperCase()}${lower.substring(1)}`;
            },
        )
        .join('');
};

export const cameliseArray = (input: any[], delimiter: string = '_'): any[] => {
    return input.map(
        (item: any): any => {
            if (typeof item === 'string') {
                return item;
            }

            return camelise(item, delimiter);
        },
    );
};

export const cameliseObject = (input: Record<string, any>, delimiter: string = '_'): Record<string, any> => {
    let result: Record<string, any> = {};

    const keys = Object.keys(input);

    keys.forEach(
        (key: string): void => {
            const newKey = cameliseString(key, delimiter);

            if (typeof input[key] === 'string') {
                result[newKey] = input[key];
            } else {
                result[newKey] = camelise(input[key]);
            }
        },
    );

    return result;
};

const camelise = (input: any, delimiter: string = '_'): any => {
    switch (typeof input) {
        case 'string':
            return cameliseString(input, delimiter);
        case 'object':
            if (input instanceof Date) {
                return input;
            }

            if (input instanceof Array) {
                return cameliseArray(input);
            }

            return cameliseObject(input, delimiter);
        default:
            return input;
    }
};

export default camelise;
