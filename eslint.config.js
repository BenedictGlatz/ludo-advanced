import js from "@eslint/js";

// Globals are declared by hand instead of pulling in the `globals` package, because CLAUDE.md
// limits dev dependencies to Vite, ESLint, Prettier, Vitest and Playwright and anything else has
// to be asked for. The lists below are short enough that maintaining them costs less than the
// conversation would.
const browserGlobals = {
  document: "readonly",
  window: "readonly",
  console: "readonly",
  location: "readonly",
  navigator: "readonly",
  localStorage: "readonly",
  URLSearchParams: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  requestAnimationFrame: "readonly",
  // Only ever used inside a Playwright `page.evaluate`, which runs in the browser and not in the test
  // process. It is here rather than in a test-only list because that is where the browser globals live
  // and adding a second list for one name would be the more confusing arrangement.
  MutationObserver: "readonly",
};

const nodeGlobals = {
  process: "readonly",
  console: "readonly",
  URL: "readonly",
  Buffer: "readonly",
};

// The import bans alone would still allow a bare `document.querySelector`, since no import is needed
// to reach a global. This closes that hole, and it is shared by every headless layer: `core/`,
// `state/` and, since issue #43, `ai/`. One list rather than one per layer, because two copies of the
// same six names are two lists that drift, and the drift is silent.
const noBrowserGlobals = [
  "error",
  { name: "document", message: "src/core/, src/state/ and src/ai/ run without a DOM. See NFR-01." },
  { name: "window", message: "src/core/, src/state/ and src/ai/ run without a DOM. See NFR-01." },
  {
    name: "navigator",
    message: "src/core/, src/state/ and src/ai/ run without a browser. See NFR-01.",
  },
  { name: "localStorage", message: "No persistence in the MVP. See FR-45." },
  { name: "$", message: "jQuery belongs in src/ui/. See NFR-01." },
  { name: "jQuery", message: "jQuery belongs in src/ui/. See NFR-01." },
];

// The two rules NFR-01 turns into a failing lint run rather than a review comment.
const coreLayerBans = {
  // No sibling layer, in either direction of the import path.
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["**/state/*", "**/state/**", "**/ui/*", "**/ui/**", "**/i18n/*", "**/i18n/**"],
          message:
            "src/core/ is the pure rules layer. It must not import from state/, ui/ or i18n/. See NFR-01.",
        },
      ],
      paths: [
        {
          name: "jquery",
          message: "src/core/ runs without a browser. jQuery belongs in src/ui/. See NFR-01.",
        },
        {
          name: "i18next",
          message:
            "src/core/ produces reason codes, never translated text. i18next belongs in src/ui/. See NFR-01.",
        },
      ],
    },
  ],
  "no-restricted-globals": noBrowserGlobals,
};

// NFR-01 gained a third layer with issue #43. `ai/` sits between `ui/` and `state/`: it may read the
// state and it may ask `core/` about the rules, but it produces intents and never pixels. So the ban
// is the same shape as `coreLayerBans` with `state/` taken out of the forbidden group.
//
// `src/ai/**` is deliberately **not** in the `browserGlobals` file list further down, which means a
// bare `window` in a bot file is an ordinary `no-undef` on top of this rule. Two failures for one
// mistake is the right number when the mistake is a layer violation.
const aiLayerBans = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["**/ui/*", "**/ui/**", "**/i18n/*", "**/i18n/**"],
          message:
            "src/ai/ decides moves, it does not draw them. It must not import from ui/ or i18n/. See NFR-01.",
        },
      ],
      paths: [
        {
          name: "jquery",
          message: "src/ai/ runs without a browser. jQuery belongs in src/ui/. See NFR-01.",
        },
        {
          name: "i18next",
          message: "src/ai/ never produces text. i18next belongs in src/ui/. See NFR-01.",
        },
      ],
    },
  ],
  "no-restricted-globals": noBrowserGlobals,
};

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "00-Meta/AI-Prompts/**",
      // Design deliverables, not project source. Claude Design drops a generated canvas runtime
      // (`support.js`, `_ds_bundle.js`) next to every `.dc.html` board, several thousand lines of
      // it, and those files are marked "do not edit" by the tool that wrote them. Nothing here is
      // built or shipped: `01-Design/README.md` says the CSS lands in `src/ui/styles/` instead. So
      // linting them only ever reports on somebody else's code.
      "01-Design/**",
    ],
  },

  js.configs.recommended,

  {
    // NFR-02, the 300-line limit, applied to every JavaScript file in the repository: source,
    // tests and config alike, exactly as CLAUDE.md words it. Blank lines and comments are counted,
    // because the constraint explicitly forbids getting under the limit by deleting either.
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "max-lines": ["error", { max: 300, skipBlankLines: false, skipComments: false }],
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },

  {
    files: ["src/core/**/*.js", "src/state/**/*.js"],
    rules: coreLayerBans,
  },

  {
    // state/ may import core/, so only the DOM half of the ban applies to it. Re-stating the
    // import rule as "core only" keeps that difference explicit instead of implied.
    files: ["src/state/**/*.js"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/ui/*", "**/ui/**"],
              message: "src/state/ must not import from ui/. The dependency runs the other way.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/ai/**/*.js"],
    rules: aiLayerBans,
  },

  {
    // `src/options.js` is here for one name, `URLSearchParams`. It is not a `ui/` file and holds no
    // jQuery: it parses the address bar, which is a browser fact, and it is listed by name so that a
    // future non-browser module at the top of `src/` does not inherit a DOM by sitting next to it.
    files: ["src/ui/**/*.js", "src/main.js", "src/options.js"],
    languageOptions: { globals: browserGlobals },
  },

  {
    files: ["src/i18n/**/*.js"],
    languageOptions: { globals: browserGlobals },
  },

  {
    files: ["tests/**/*.js"],
    languageOptions: { globals: { ...browserGlobals, ...nodeGlobals } },
  },

  {
    files: ["*.config.js", "scripts/**/*.js"],
    languageOptions: { globals: nodeGlobals },
  },

  {
    // A script that drives Playwright runs in Node, but the callback it passes to `page.evaluate`
    // is serialised and executed inside the browser, so `document` and `window` are legitimately in
    // scope there. Both global sets apply to these files. Listed by name rather than by directory,
    // so that an ordinary Node script under `scripts/` still fails if it reaches for a DOM.
    files: ["scripts/design-screenshots.js"],
    languageOptions: { globals: { ...nodeGlobals, ...browserGlobals } },
  },
];
