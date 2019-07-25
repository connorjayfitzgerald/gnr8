// ------------------------------- NODE MODULES -------------------------------

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

// export const toUpperCase = (value: string | string[]): string | string[] => {
//     if (value instanceof Array) {
//         return value.map((element: string): string => element.toUpperCase());
//     }

//     return value.toUpperCase();
// };

// /**
//  * Takes in an ISO string. If the time part has not been provided, default to T23:59:59
//  */
// export const toEndDate = (value: string): Date => {
//     const date = new Date(value);

//     if (value.length === 10) {
//         date.setHours(23);
//         date.setMinutes(59);
//         date.setSeconds(59);
//     }

//     return date;
// };
