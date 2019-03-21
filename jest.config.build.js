module.exports = {
    ...require('@socifi/jest-config')('build'),
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
