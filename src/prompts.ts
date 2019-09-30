// ------------------------------- NODE MODULES -------------------------------

import inquirer, { Question } from 'inquirer';

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const namePrompt = async (input: string | null): Promise<string> => {
    const transformer = (input: string): string => input.toLowerCase().replace(/\s/g, '');
    const validator = (input: string): boolean | string =>
        input.length > 0 && !input.includes(' ') ? true : 'Please enter a valid name';

    if (input) {
        const transformed = transformer(input);

        if (validator(transformed) === true) {
            return transformed;
        }

        console.log(`${input} is not a valid name`);
    }

    const question: Question = {
        name: 'name',
        message: 'Kebab-cased name of the application? e.g. my-new-app',
        validate: validator,
        transformer,
        filter: transformer,
    };

    const result = await inquirer.prompt([question]);

    return result.name;
};

export const descriptionPrompt = async (description: string | null): Promise<string> => {
    if (description) {
        return description;
    }

    const question: Question = {
        name: 'description',
        message: `Give a brief description of the app's purpose:`,
    };

    const result = await inquirer.prompt([question]);

    return result.description || '';
};

interface DatabaseDetails {
    connectionString: string;
    username: string;
    password: string;
}

export const databasePrompt = async (): Promise<DatabaseDetails | undefined> => {
    const questions: Question[] = [
        {
            name: 'dbReqd',
            type: 'confirm',
            message: `Would you like to provide database connection details?`,
        },
        {
            name: 'connectionString',
            message: `What is the database connection string?`,
            when: (answers): boolean => answers.dbReqd === true,
        },
        {
            name: 'username',
            message: `What is the database username?`,
            when: (answers): boolean => answers.dbReqd === true,
        },
        {
            name: 'password',
            type: 'password',
            message: `What is the database password?`,
            when: (answers): boolean => answers.dbReqd === true,
        },
    ];

    const results = await inquirer.prompt(questions);

    if (results.dbReqd !== true) {
        return undefined;
    }

    const { connectionString, username, password } = results;

    return {
        connectionString,
        username,
        password,
    };
};
