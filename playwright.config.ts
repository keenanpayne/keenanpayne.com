import { defineConfig, devices } from "@playwright/test";

/**
 * The accessibility audit (`npm run a11y`): every direction's checked pages
 * in a real browser, against WCAG 2.2 AAA (`app/lab/accessibility/`). It
 * starts a dev server of its own on a port nothing else uses, so it always
 * audits this checkout; set `A11Y_URL` to audit one that's already running
 * (or a deploy preview) instead.
 */

const PORT = 4343;
const external = process.env.A11Y_URL;

export default defineConfig({
  testDir: "app/lab/accessibility",
  testMatch: "*.spec.ts",
  outputDir: "test-results/a11y",
  // One test per direction, each walking every page in both schemes and
  // at both widths
  timeout: 10 * 60_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI
    ? [["github"], ["list"]]
    : [
        ["list"],
        ["html", { open: "never", outputFolder: "test-results/a11y-report" }]
      ],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: external ?? `http://localhost:${PORT}`
  },
  webServer: external
    ? undefined
    : {
        command: `npm run dev -- --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}/`,
        reuseExistingServer: false,
        timeout: 120_000,
        stdout: "ignore"
      }
});
