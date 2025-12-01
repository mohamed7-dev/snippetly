import { defineConfig } from "eslint/config";
import { config as base } from "@snippetly/eslint-config/base";
import globals from "globals";

export default defineConfig([
  // shared JS/TS + prettier + only-warn + dist ignore
  ...base,

  // Node-specific settings for the server
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },
  },
]);
