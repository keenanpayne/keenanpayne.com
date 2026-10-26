import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y-x";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  // Other Claude Code sessions' checkouts of this repository, too
  globalIgnores([
    "build/",
    ".react-router/",
    ".netlify/",
    ".claude/worktrees/"
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  // Accessibility in the markup itself: names, roles, alt text, labels
  // (the browser audit, `npm run a11y`, checks the rendered pages)
  { files: ["**/*.tsx"], ...jsxA11y.configs.strict },
  {
    files: ["**/*.tsx"],
    rules: {
      // A region that scrolls takes focus, so the keyboard can scroll it
      "jsx-a11y-x/no-noninteractive-tabindex": [
        "error",
        { roles: ["tabpanel", "region"], allowExpressionValues: true }
      ]
    }
  },
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
