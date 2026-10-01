import { config as base } from '@snippetly/eslint-config/base';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';

export default defineConfig([
    ...base,

    // React-specific rules for the client
    {
        files: ['**/*.{ts,tsx}'],
        ...reactPlugin.configs.flat.recommended,
        ...reactHooksPlugin.configs.flat.recommended,
        ...reactRefreshPlugin.configs.recommended,
        ...reactRefreshPlugin.configs.vite,
        languageOptions: {
            ...reactPlugin.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.browser,
                ...globals.serviceworker,
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: path.join(import.meta.dirname, 'tsconfig.json'),
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
]);
