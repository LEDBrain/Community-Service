module.exports = {
    env: {
        node: true,
        es2020: true,
    },
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
        'guard-for-in': 'error',
        'no-prototype-builtins': 'off',
        'semi': ['error', 'always'],
    },
};
