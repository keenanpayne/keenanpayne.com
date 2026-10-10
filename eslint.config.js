import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["build/", ".react-router/", ".netlify/"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": "warn"
    }
  },
  {
    // Command-line scripts report their results to the console
    files: ["scripts/**"],
    rules: { "no-console": "off" }
  },
  prettier
]);
