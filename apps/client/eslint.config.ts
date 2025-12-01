import { config as base } from '@snippetly/eslint-config/base'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactRefreshPlugin from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'
import { tanstackConfig } from '@tanstack/eslint-config'
import globals from 'globals'

export default defineConfig([
  // shared JS/TS + prettier + only-warn setup
  ...base,

  ...tanstackConfig,

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
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
])
