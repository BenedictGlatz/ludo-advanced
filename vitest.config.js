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
      // `json-summary` is in this list because of a measured defect, not for completeness: on this
      // setup the `text` reporter prints correct totals and an **empty per-file table**, so the
      // per-directory figure NFR-05 asks for cannot be read off the terminal output. The numbers in
      // `coverage/coverage-summary.json` are correct and are what Chapter 09 quotes.
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
      // NFR-05 applies to these two layers only, for the reason given in Chapter 08: a coverage
      // figure for `ui/` would measure how much jQuery ran, not whether anything works.
      include: ["src/core/**/*.js", "src/state/**/*.js"],
      // `all: true` counts files that no test imports at all. Without it a module nobody tested is
      // simply absent from the report, and the percentage stays high by leaving work out of the
      // denominator. That is the one way a coverage floor can be met while getting worse.
      all: true,
      thresholds: {
        lines: 80,
      },
    },
  },
});
