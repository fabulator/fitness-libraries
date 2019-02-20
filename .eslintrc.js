module.exports = {
    extends: [
        '@socifi',
    ],
    rules: {
        'camelcase': 0,
        'no-useless-constructor': 0,
        '@typescript-eslint/no-parameter-properties': 0,
        '@typescript-eslint/camelcase': 0,
        'no-param-reassign': 0,
        '@typescript-eslint/member-delimiter-style': [2, {
            multiline: {
                delimiter: 'comma',
                requireLast: true,
            },
            singleline: {
                delimiter: 'comma',
                requireLast: false,
            },
        }],
    },
};
