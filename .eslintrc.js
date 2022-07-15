module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier'
    ],
    plugins: ['simple-import-sort'],
    env: {
        'node': true
    },
    rules: {
        'object-curly-spacing': ['error', 'always'],
        semi: ['error', 'never'],
        'simple-import-sort/imports': [
            'error',
            {
                groups: [
                    ['^[^@.].*\\u0000$', '^.*\u0000$'],
                    ['^\\u0000'],
                    ['^@?\\w'],
                    ['^'],
                    ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                    ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                ],
            },
        ],
        quotes: [2, 'single']
    },
}