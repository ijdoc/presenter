import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/", "test/fixtures/"] },
  js.configs.recommended,
  {
    files: ["src/**/*.js", "enhancements/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.webextensions },
    },
    rules: {
      // An MV3 extension runs under a CSP that forbids both. Either one is a runtime failure
      // in the page, not a style preference.
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
    },
  },
  {
    files: ["src/content/loader.js"],
    languageOptions: { sourceType: "script" },
  },
  {
    files: ["test/**/*.js", "*.config.{js,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // DOM tests run under jsdom, so browser globals are real there too.
      globals: { ...globals.node, ...globals.browser },
    },
  },
];
