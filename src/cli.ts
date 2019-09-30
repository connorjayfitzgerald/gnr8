#!/usr/bin/env node

// ------------------------------- NODE MODULES -------------------------------

import clear from 'clear';
import program, { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';

// ------------------------------ CUSTOM MODULES ------------------------------

import { config } from './config';
import { namePrompt, descriptionPrompt, databasePrompt } from './prompts';
import { scaffold } from './scaffold';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

clear();

const init = async (opts: Command): Promise<void> => {
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

program
    .command('init')
    .description('Scaffold a new API project')
    .option('-n ,--name <name>', 'Name of the application')
    .option('-d ,--description <description>', 'Brief description of the application')
    .option('--no-db', `Don't prompt for database credentials`)
    .action(init);

program
    .version(config.version)
    .name('gnr8')
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}
