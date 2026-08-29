import { defineConfig } from "vitest/config";

// `environment: "node"` is not a default we happened to keep. It is the second half of NFR-01's
// acceptance criterion: `core/` and `state/` unit tests run with no DOM configured at all, so a
// module in either layer that reaches for `document`, `window` or jQuery fails a test run rather
// than a code review. `ui/` is deliberately not unit tested; Playwright covers it in a real browser.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.js"],
    // Playwright owns tests/e2e. Vitest must not try to run those files.
    exclude: ["node_modules/**", "dist/**", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      // NFR-05 applies to these two layers only, for the reason given in Chapter 08: a coverage
      // figure for `ui/` would measure how much jQuery ran, not whether anything works.
      include: ["src/core/**/*.js", "src/state/**/*.js"],
      thresholds: {
        lines: 80,
      },
    },
  },
});
