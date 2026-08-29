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
};

const nodeGlobals = {
  process: "readonly",
  console: "readonly",
  URL: "readonly",
  Buffer: "readonly",
};

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
  // The import ban alone would still allow a bare `document.querySelector`, since no import is
  // needed to reach a global. This closes that hole.
  "no-restricted-globals": [
    "error",
    { name: "document", message: "src/core/ and src/state/ run without a DOM. See NFR-01." },
    { name: "window", message: "src/core/ and src/state/ run without a DOM. See NFR-01." },
    { name: "navigator", message: "src/core/ and src/state/ run without a browser. See NFR-01." },
    { name: "localStorage", message: "No persistence in the MVP. See FR-45." },
    { name: "$", message: "jQuery belongs in src/ui/. See NFR-01." },
    { name: "jQuery", message: "jQuery belongs in src/ui/. See NFR-01." },
  ],
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
    files: ["src/ui/**/*.js", "src/main.js"],
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
];
