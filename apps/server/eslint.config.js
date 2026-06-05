import { config } from "@snippetly/eslint-config/node";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...config,
  {
    ignores: ["eslint.config.js"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  {
    files: ["eslint.config.js"],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
]);
