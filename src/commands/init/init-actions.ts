// ------------------------------- NODE MODULES -------------------------------

import { copy, readFile, writeFile, move } from 'fs-extra';
import path from 'path';
import klaw from 'klaw';
import through2 from 'through2';
import { spawn } from 'child_process';
import ora from 'ora';
import del from 'del';

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
    skipHello?: boolean;
}

const toSpaceCased = (kebabCased: string): string => {
    return kebabCased
        .split('-')
        .map((word): string => {
            return `${word[0].toUpperCase()}${word.substring(1)}`;
        })
        .join(' ');
};

const createTokens = (opts: ScaffoldOptions): FindReplace[] => {
    const {
        dbDetails: { connectionString, username, password } = {
            connectionString: '',
            username: '',
            password: '',
        },
        name,
        description = '',
    } = opts;

    return [
        { find: /#DB_CONN_STRING#/g, replace: connectionString },
        { find: /#DB_PASSWORD#/g, replace: password },
        { find: /#DB_USER#/g, replace: username },
        { find: /#DESCRIPTION#/g, replace: description },
        { find: /#KEBAB_CASED#/g, replace: name },
        { find: /#SPACE_CASED#/g, replace: toSpaceCased(name) },
    ];
};

const excludeDirFilter = through2.obj(function(item, enc, next): void {
    if (!item.stats.isDirectory()) {
        this.push(item);
    }

    return next();
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

interface FindReplace {
    find: RegExp;
    replace: string;
}

const replaceInFile = async (path: string, tokens: FindReplace[]): Promise<void> => {
    const file = await readFile(path, 'utf8');

    let newFile = file;

    tokens.forEach((token): void => {
        const { find, replace } = token;

        newFile = newFile.replace(find, replace);
    });

    await writeFile(path, newFile);
};

const replaceInFiles = async (files: string[], tokens: FindReplace[]): Promise<void> => {
    await files.map((file): Promise<void> => replaceInFile(file, tokens));
};

const renameFile = async (path: string, tokens: FindReplace[]): Promise<void> => {
    let newPath = path;

    tokens.forEach((token): void => {
        const { find, replace } = token;

        newPath = newPath.replace(find, replace);
    });

    if (newPath !== path) {
        await move(path, newPath);
    }
};

const renameFiles = async (files: string[], tokens: FindReplace[]): Promise<void> => {
    await files.map((file): Promise<void> => renameFile(file, tokens));
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

interface PostmanItem {
    name: string;
}

interface PostmanCollection {
    item: PostmanItem[];
}

const removeHelloFromDocs = async (dest: string): Promise<void> => {
    const collectionPath = path.join(dest, 'docs', '#KEBAB_CASED#.postman_collection.json');

    const collection = (await import(collectionPath)) as PostmanCollection;

    const index = collection.item.findIndex((item): boolean => item.name === 'Say Hello');

    collection.item.splice(index, 1);

    await writeFile(collectionPath, JSON.stringify(collection, null, 4));
};

export const scaffold = async (opts: ScaffoldOptions): Promise<void> => {
    const { name, skipInstall = false, skipHello = false } = opts;

    const src = path.join(__dirname, '..', '..', '..', 'templates', 'initial');
    const dest = path.join(process.cwd(), name);

    await copy(src, dest);
    const files = await getFiles(dest);

    const tokens = createTokens(opts);

    if (skipHello === true) {
        await removeHelloFromDocs(dest);
    }

    await replaceInFiles(files, tokens);
    await renameFiles(files, tokens);

    await createGitIgnore(dest);

    if (skipInstall !== true) {
        await runCommand('npm install', dest, 'Installing node modules');
    }

    if (skipHello === true) {
        await del(path.join(dest, 'src', 'api', 'resources', 'hello'));
        await replaceInFile(path.join(dest, 'src', 'api', 'resources', 'load-routers.ts'), [
            {
                find: /import { helloRouter } from '\.\/hello';[\r\n]*/g,
                replace: '',
            },
            {
                find: /helloRouter, /g,
                replace: '',
            },
        ]);
    }
};
