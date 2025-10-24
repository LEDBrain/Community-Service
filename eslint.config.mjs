import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    globalIgnores(['dist/**', 'node_modules/**', '**/generated/**']),
    {
        files: ['**/*.ts'],
        extends: compat.extends(
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended'
        ),

        plugins: {
            '@typescript-eslint': typescriptEslint,
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },

            ecmaVersion: 2020,
            sourceType: 'module',

            parserOptions: {
                parser: '@typescript-eslint/parser',
            },
        },

        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',

            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                },
            ],

            'guard-for-in': 'error',
            'no-prototype-builtins': 'off',
            'semi': ['error', 'always'],
        },
    },
]);
