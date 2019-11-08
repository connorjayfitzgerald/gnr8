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

        const { skipInstall = false, skipHello = false, skipDb = false } = opts;

        const dbDetails = !skipDb
            ? await databasePrompt()
            : {
                  connectionString: '',
                  username: '',
                  password: '',
              };

        console.log('\n');

        await scaffold({ name, description, dbDetails, skipInstall, skipHello });

        console.log(chalk.green('\nSuccess!'));

        if (skipInstall === true) {
            console.warn(
                chalk.yellow(`\nnode_modules have not been installed. You'll need to run "npm install" first!`),
            );
        }

        console.log(`\nTo get started, run the following commands:\n`);

        console.log(chalk.cyan(`cd ${name}`));
        if (skipInstall) {
            console.log(chalk.cyan(`npm install`));
        }
        console.log(chalk.cyan('npm start'));

        console.log('\nThen try sending a GET request to http://localhost:3000/hello?name=Connor');
    } catch (err) {
        console.error('Failed to generate');
        console.error(err.message);

        process.exit(1);
    }
};
