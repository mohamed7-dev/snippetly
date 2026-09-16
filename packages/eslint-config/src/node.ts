import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { config as baseConfig } from './base.js';

/**
 * @description
 * A custom ESLint configuration for applications that use nodejs.
 * */
export const config = defineConfig([
    ...baseConfig,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
            parserOptions: {
                projectService: true,
            },
        },
    },
]);
