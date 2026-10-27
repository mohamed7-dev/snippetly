// @ts-check

/**
 * @type {import("prettier").Config}
 */
module.exports = {
  singleQuote: true,
  tabWidth: 4,
  printWidth: 110,
  trailingComma: "all",
  arrowParens: "avoid",
  htmlWhitespaceSensitivity: "ignore",
  plugins: ["prettier-plugin-organize-imports"],
};
