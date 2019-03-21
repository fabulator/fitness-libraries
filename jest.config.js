module.exports = {
    ...require('@socifi/jest-config')(),
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
