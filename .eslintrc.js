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
        'guard-for-in': 2,
        'no-prototype-builtins': 0,
        semi: ['error', 'always'],
    },
};
