#!/usr/bin/env node

// ------------------------------- NODE MODULES -------------------------------

import clear from 'clear';
import program from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';

// ------------------------------ CUSTOM MODULES ------------------------------

import { config } from './config';
import { namePrompt, descriptionPrompt, databasePrompt } from './prompts';
import { scaffold } from './scaffold';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

clear();

program
    .version(config.version)
    .name('gnr8')
    .option('-n ,--name <name>', 'Name of the application')
    .option('-d ,--description <description>', 'Brief description of the application')
    .option('--no-db', `Don't prompt for database credentials`)
    .parse(process.argv);

const run = async (): Promise<void> => {
    try {
        console.log(`${chalk.yellowBright(figlet.textSync('gnr8', { horizontalLayout: 'full' }))}\n`);

        const name = await namePrompt(typeof program.name === 'string' ? ((program.name as unknown) as string) : null);

        const description = await descriptionPrompt(
            typeof program.description === 'string' ? ((program.description as unknown) as string) : null,
        );

        const dbDetails = program.db
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

run();
