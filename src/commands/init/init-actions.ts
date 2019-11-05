// ------------------------------- NODE MODULES -------------------------------

import { copy, readFile, writeFile, rename } from 'fs-extra';
import path from 'path';
import klaw from 'klaw';
import through2 from 'through2';
import { spawn } from 'child_process';
import ora from 'ora';

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

// ----------------------------- FILE DEFINITION ------------------------------

interface ScaffoldOptions {
    name: string;
    description: string;
    dbDetails?: {
        connectionString: string;
        username: string;
        password: string;
    };
    skipInstall?: boolean;
}

const toSpaceCased = (kebabCased: string): string => {
    return kebabCased
        .split('-')
        .map((word): string => {
            return `${word[0].toUpperCase()}${word.substring(1)}`;
        })
        .join(' ');
};

const createTokens = (opts: ScaffoldOptions): Record<string, string> => {
    const dbDetails = opts.dbDetails || {
        connectionString: '',
        username: '',
        password: '',
    };

    return {
        '#DB_CONN_STRING#': dbDetails.connectionString,
        '#DB_PASSWORD#': dbDetails.password,
        '#DB_USER#': dbDetails.username,
        '#DESCRIPTION#': opts.description || '',
        '#KEBAB_CASED#': opts.name,
        '#SPACE_CASED#': toSpaceCased(opts.name),
    };
};

const excludeDirFilter = through2.obj(function(item, enc, next): void {
    if (!item.stats.isDirectory()) this.push(item);
    next();
});

const getFiles = (path: string): Promise<string[]> =>
    new Promise((resolve, reject): void => {
        const files: string[] = [];

        klaw(path)
            .pipe(excludeDirFilter)
            .on('data', (item): number => files.push(item.path))
            .on('end', (): void => resolve(files))
            .on('error', (err): void => reject(err));
    });

const replaceInFile = async (path: string, tokens: Record<string, any>): Promise<void> => {
    const file = await readFile(path, 'utf8');

    let newFile = file;

    Reflect.ownKeys(tokens).forEach((token): void => {
        newFile = newFile.replace(new RegExp(String(token), 'g'), tokens[String(token)]);
    });

    await writeFile(path, newFile);
};

const replaceInFiles = async (files: string[], tokens: Record<string, string>): Promise<void> => {
    const promises: Promise<void>[] = [];

    files.forEach((file): number => promises.push(replaceInFile(file, tokens)));

    await Promise.all(promises);
};

const renameFile = async (path: string, tokens: Record<string, any>): Promise<void> => {
    let newPath = path;

    Reflect.ownKeys(tokens).forEach((token): void => {
        newPath = newPath.replace(new RegExp(String(token), 'g'), tokens[String(token)]);
    });

    await rename(path, newPath);
};

const renameFiles = async (files: string[], tokens: Record<string, string>): Promise<void> => {
    const promises: Promise<void>[] = [];

    files.forEach((file): number => promises.push(renameFile(file, tokens)));

    await Promise.all(promises);
};

const runCommand = async (command: string, cwd: string, description: string): Promise<void> =>
    new Promise((resolve, reject): void => {
        const spinner = ora({
            color: 'yellow',
            text: description,
        }).start();

        const ls = spawn(command, { shell: true, cwd });

        ls.on('error', (err): void => {
            spinner.stopAndPersist({
                prefixText: 'Failed: ',
            });
            return reject(err);
        });

        ls.on('close', (): void => {
            spinner.stopAndPersist({
                prefixText: 'Success: ',
            });
            return resolve();
        });
    });

export const createGitIgnore = async (dest: string): Promise<void> => {
    const data = 'node_modules\n.env\ndist\ncoverage\n*.log';

    await writeFile(path.join(dest, '.gitignore'), data);
};

export const scaffold = async (opts: ScaffoldOptions): Promise<void> => {
    const { name, skipInstall = false } = opts;

    const src = path.join(__dirname, '..', '..', '..', 'templates', 'initial');
    const dest = path.join(process.cwd(), name);

    await copy(src, dest);
    const files = await getFiles(dest);

    await replaceInFiles(files, createTokens(opts));
    await renameFiles(files, createTokens(opts));

    await createGitIgnore(dest);

    if (skipInstall !== true) {
        await runCommand('npm install', dest, 'Installing node modules');
    }
};
