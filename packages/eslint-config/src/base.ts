import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

/**
 * @description
 * A shared ESLint configuration for the repository.
 * */
export const config = defineConfig([
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    // {
    //     plugins: {
    //         onlyWarn,
    //     },
    // },
    {
        ignores: ['dist/**'],
    },
]);
