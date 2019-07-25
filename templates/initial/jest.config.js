module.exports = {
    roots: ['./tests'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    setupFiles: ['./tests/setup.ts'],
};
