// ------------------------------- NODE MODULES -------------------------------

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';

// ------------------------------ CUSTOM MODULES ------------------------------

import { namePrompt, descriptionPrompt, databasePrompt } from './init-prompts';
import { scaffold } from './init-actions';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

export const init = async (opts: Command): Promise<void> => {
    try {
        console.log(`${chalk.yellowBright(figlet.textSync('gnr8', { horizontalLayout: 'full' }))}\n`);

        const name = await namePrompt(typeof opts.name === 'string' ? `${opts.name}` : null);

        const description = await descriptionPrompt(
            typeof opts.description === 'string' ? `${opts.description}` : null,
        );

        const dbDetails = opts.db
            ? await databasePrompt()
            : {
                  connectionString: '',
                  username: '',
                  password: '',
              };

        console.log('\n');

        await scaffold({ name, description, dbDetails });

        console.log(chalk.green('\nSuccess!'));
        console.log(`\nTo get started, run the following commands:\n`);

        console.log(chalk.cyan(`cd ${name}`));
        console.log(chalk.cyan('npm run dev'));

        console.log('\nThen try sending a GET request to http://localhost:3000/hello?name=Connor');
    } catch (err) {
        console.log('Failed to generate');
        console.log(err.message);
    }
};
