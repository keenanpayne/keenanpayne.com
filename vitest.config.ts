import { defineConfig } from "vitest/config";

// Unit tests for the content pipeline's pure helpers; the app's Vite config
// (React Router, Netlify) isn't needed for them.
export default defineConfig({
  test: {
    include: ["app/**/*.test.ts"]
  }
});
