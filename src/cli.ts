#!/usr/bin/env node

// ------------------------------- NODE MODULES -------------------------------

import clear from 'clear';
import program from 'commander';

// ------------------------------ CUSTOM MODULES ------------------------------

import { config } from './config';
import { init } from './commands';

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

clear();

program
    .command('init')
    .description('Scaffold a new API project')
    .option('-n ,--name <name>', 'Name of the application')
    .option('-d ,--description <description>', 'Brief description of the application')
    .option('--no-db', `Don't prompt for database credentials`)
    .action(init);

// program
//     .command('init')
//     .description('Add a new resource to an existing API')
//     .option('-n ,--name <name>', 'Name of the application')
//     .option('-d ,--description <description>', 'Brief description of the application')
//     .option('--no-db', `Don't prompt for database credentials`)
//     .action(init);

program
    .version(config.version)
    .name('gnr8')
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}
