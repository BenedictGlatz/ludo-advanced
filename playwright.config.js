import { defineConfig, devices } from "@playwright/test";

const PREVIEW_PORT = 4173;
const BASE_URL = `http://localhost:${PREVIEW_PORT}`;

/**
 * The resolution the design is drawn for, and the one FR-31 is about.
 *
 * It has to be spread into every project **after** `devices[...]`, and that is not a style choice.
 * Each of Playwright's device descriptors carries its own viewport, 1280 by 720 for Desktop Chrome,
 * so a viewport set only in `use` above is silently overridden by every project. From 2026-08-14 to
 * 2026-08-31 this file said 1440 by 900 and the suite ran at 1280 by 720, which is below the 84rem
 * breakpoint of design spec 03: every test was quietly playing the stacked mobile-ish layout.
 */
const DESIGN_VIEWPORT = { width: 1440, height: 900 };

// Decided here, because section 8 of Test-Plan-and-Quality-Strategy.md left it open and said it
// would be settled in this file: **the end-to-end suite runs against the production build**, not
// against the Vite dev server. The dev server serves modules straight off disk and hides exactly
// the class of defect a build introduces, such as an asset the build forgets to copy or a path
// that only resolves in development. The cost is a `vite build` before every run, which is a few
// seconds. Rejected: running against `npm run dev`, which is faster and tests something the player
// never receives.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // NFR-10 is desktop only, so no mobile viewport is configured anywhere in this file. The
    // viewport itself is set per project, for the reason above DESIGN_VIEWPORT.
  },

  // NFR-10: current and previous major versions of Chrome, Firefox and Edge. Playwright ships one
  // pinned build per engine rather than a version matrix, so "current and previous" is not
  // something this file can assert. What it does cover is the three engines.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: DESIGN_VIEWPORT } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: DESIGN_VIEWPORT } },
    // Edge is the system browser rather than a downloaded one, so this project needs Microsoft
    // Edge installed on the machine running the suite.
    {
      name: "msedge",
      use: { ...devices["Desktop Edge"], channel: "msedge", viewport: DESIGN_VIEWPORT },
    },
  ],

  webServer: {
    command: "npm run build && npm run preview",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
