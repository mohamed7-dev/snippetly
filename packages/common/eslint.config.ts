import { config as base } from '@snippetly/eslint-config/node';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    ...base,
    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
]);
