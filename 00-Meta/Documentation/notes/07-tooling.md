# 07 Tooling

> **Covers:** the developer toolchain: npm scripts, package management, linter, formatter, builds,
> deployment.
> **Does not cover:** tests and coverage, which are Chapter 08, even though they are run through
> npm scripts listed here.

## What this chapter must answer

- Every npm script, what it is for. A table.
- Package management: which dependencies are production and which are development, and the policy
  that governs adding one.
- Linter: which one, where configured, which plugins, which classes of error it catches.
- Formatter: which one, what it owns, and how the split with the linter is kept clean.
- JSDoc or equivalent documentation enforcement: whether it exists, and if not, why not.
- TypeScript: deliberately absent here, so it needs a stated reason.
- Dev build, production build, deployment. If there is no deployment, name that and say what the
  path would be.

Every one of these points appears even when the answer is "not used": a deliberate omission with a
reason reads as a decision, a silent gap reads as a miss.

## Facts

### Target npm scripts

Declared in [CLAUDE.md](../../../CLAUDE.md) as the binding specification for `package.json`:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with `--fix` |
| `npm run format` | Prettier `--write` |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest, watch mode |
| `npm run test:coverage` | Vitest with v8 coverage |
| `npm run test:e2e` | Playwright, all browsers |
| `npm run docs:ai-index` | Generate Chapter 13 from the AI prompt log |

One script exists that this list does not name, added 2026-08-30 with issue #30:

| Script | Purpose |
| --- | --- |
| `npm run test:seeds` | Replay matches headlessly and print the seeds `tests/e2e/helpers.js` pins |

### Constraints that shape the toolchain

- **JavaScript only, no TypeScript.** No `.ts` files and no build-time type checking. The reason is
  not yet recorded and must be.
- **No file longer than 300 lines**: source, tests and config alike. When a file approaches the
  limit it is split along a real seam, not compressed by stripping whitespace or comments. This
  constraint is what makes the strict `core`/`state`/`ui` layering necessary rather than decorative,
  which is a point worth making in the report.
- **No hardcoded user-facing strings.** Every player-readable string goes through i18next.

### Toolchain bootstrapped: 2026-08-29, issue #63

The first commit in this repository that is not documentation. It lands **23 days after the
repository was created** and **4 days after milestone M1** (toolchain up, due 2026-08-25).

**All 11 scripts of `CLAUDE.md` exist and were run**, apart from `test:e2e`, which has no spec to run
yet. Their real implementations:

| Script | Runs |
| --- | --- |
| `dev` | `vite` |
| `build` | `vite build` |
| `preview` | `vite preview` |
| `lint` | `eslint .` |
| `lint:fix` | `eslint . --fix` |
| `format` | `prettier --write .` |
| `test` | `vitest run` |
| `test:watch` | `vitest` |
| `test:coverage` | `vitest run --coverage` |
| `test:e2e` | `playwright test` |
| `docs:ai-index` | `node scripts/docs-ai-index.js` |

**Versions actually installed** (read from `node_modules/<pkg>/package.json`, not from memory):

| Package | Kind | Version |
| --- | --- | --- |
| `jquery` | runtime | 4.0.0 |
| `i18next` | runtime | 26.4.0 |
| `vite` | dev | 8.2.2 |
| `eslint` | dev | 10.9.1 |
| `@eslint/js` | dev | 10.0.1 |
| `prettier` | dev | 3.9.6 |
| `vitest` | dev | 4.1.11 |
| `@vitest/coverage-v8` | dev | 4.1.11 |
| `@playwright/test` | dev | 1.62.1 |

Environment: Node v24.11.0, npm 11.6.1, Windows 11.

#### The two lint rules that turn architecture prose into a failing build

This is the part of the bootstrap worth a paragraph in the report, because it converts two written
constraints into machine-checked ones.

- **`max-lines: ["error", { max: 300, skipBlankLines: false, skipComments: false }]`** on every
  `**/*.js`, which is NFR-02. Blank lines and comments are **counted**, on purpose: `CLAUDE.md` says
  a file at the limit is split along a real seam and not compressed by deleting whitespace or
  comments, so a config that skipped them would reward exactly the behaviour the rule forbids. The
  journal recorded on 2026-08-22 that the limit was unenforced. It is enforced now.
- **`no-restricted-imports` over `src/core/**`**, which is NFR-01. It bans imports matching
  `**/state/**`, `**/ui/**` and `**/i18n/**`, plus the packages `jquery` and `i18next` by name. Each
  ban carries its own message naming NFR-01, so the failure explains itself.
- **`no-restricted-globals` over `src/core/**` and `src/state/**`**, which is not in the plan and
  closes a hole in it. The import ban alone still lets a file write `document.querySelector(...)`,
  because reaching a global needs no import. `document`, `window`, `navigator`, `localStorage`, `$`
  and `jQuery` are banned by name in both layers.
- **`src/state/` gets a narrower version of the import ban**: it may import `core/` and may not import
  `ui/`. Stating that as its own config block keeps the difference between the two layers visible
  instead of implied.

**Both rules were verified by deliberately breaking them**, which is the only evidence worth having:

- A probe file `src/core/__probe.js` importing `../state/game-state.js` and `jquery` and calling
  `document.querySelector` produced 3 restriction errors plus a `no-undef`, and `eslint` exited 1.
- A generated 302-line file produced `File has too many lines (302). Maximum allowed is 300`.
- Both probes were deleted; `npm run lint` is clean afterwards.

#### Formatter, and the split with the linter

- **Prettier owns layout, ESLint owns correctness.** No formatting rules are configured in ESLint and
  no correctness rules in Prettier, so the two cannot disagree. No `eslint-config-prettier` is
  installed, because with no stylistic ESLint rules there is nothing for it to switch off.
- **`.prettierignore` excludes every markdown file and the whole of `00-Meta/`.** This is deliberate
  and it is a real trade-off. `prettier --write .` would rewrap the documentation to its own width and
  reformat every table, producing a diff of thousands of lines in which the actual change is
  invisible. The documentation is written to hand-chosen wrapping and to the `CLAUDE.md` writing
  rules, which Prettier knows nothing about. **The cost:** markdown formatting stays a matter of
  discipline rather than a tool, exactly like the em dash ban.
- **`.gitattributes` was added with `* text=auto eol=lf`.** Found by running the tools rather than by
  reasoning: this repository has `core.autocrlf=true` and all three of us are on Windows, so a fresh
  clone gets CRLF files while `.prettierrc` sets `endOfLine: "lf"`. Without the attributes file,
  `npx prettier --check .` reports every file as badly formatted on a clone nobody has touched.
- **`quoteProps: "preserve"` was added on 2026-08-29**, again found by running the tool. Prettier's
  default strips quotes from an object key when the key survives the round trip. In the movement
  tests that turned the fixture coordinate `"0.1"` into `0.1` while leaving `"0.0"` quoted, because
  `0.0` would have become `"0"`. The keys are coordinates and read as strings, so the setting hands
  the decision back to whoever wrote the line. **Rejected: `"consistent"`**, which quotes every key
  in an object only when at least one of them needs it, so an object of purely decimal-looking keys
  still came out unquoted.

#### Test runner configuration

- **`environment: "node"` in `vitest.config.js`** is the second half of NFR-01's acceptance criterion,
  not a default that happened to be kept. There is no DOM in a unit test run at all, so a `core/` or
  `state/` module reaching for `document` fails a test run and not only a lint run.
- **Coverage is scoped to `src/core/**` and `src/state/**`** with a line threshold of 80, per NFR-05.
  **Negative finding, and it matters before anyone quotes a green run:** with both directories empty,
  v8 measures `0/0`, prints `Unknown%` and the threshold does not fire. `npm run test:coverage` passes
  today for a reason unrelated to quality.
- **Playwright runs against the production build**, not the dev server. This settles the question
  section 8 of the test plan left open and said would be decided in this file. The `webServer` block
  runs `npm run build && npm run preview` on port 4173. Reason: the dev server serves modules straight
  off disk and hides the class of defect a build introduces, such as an asset the build forgets to
  copy. Rejected: running against `npm run dev`, which is faster and exercises something the player
  never receives.
- **Three Playwright projects for NFR-10**: `chromium`, `firefox` and `msedge`. Two limits stated
  rather than glossed over. Playwright ships one pinned build per engine, so "current **and previous**
  major versions" is not something the config can assert; and `msedge` uses the system Edge, so that
  project needs Edge installed on the machine running the suite. Browsers still need
  `npx playwright install` before the first run.

#### Two things added that the plan for this step did not list

Both are recorded because a deviation nobody wrote down is indistinguishable from a mistake.

- **`scripts/docs-ai-index.js` was written.** `CLAUDE.md` requires `package.json` to provide
  `docs:ai-index`, and a script pointing at a file that does not exist is a broken script. The
  generator reads every `00-Meta/AI-Prompts/*/*.json`, sorts by timestamp, groups by `topic` into the
  six subsections Chapter 13 defines, and fails loudly on an unknown `topic` or `use` instead of
  dropping the entry. **It has not been run**, because the prompt log is gitignored and per machine,
  so running it here would generate Chapter 13 from one contributor's folder and overwrite the
  chapter's own instructions with an incomplete table. It prints a warning when it sees fewer than two
  contributor folders.
- **`.gitattributes` was added**, for the line-ending reason above.

#### Dependencies installed beyond the five approved dev tools

`CLAUDE.md` approves Vite, ESLint, Prettier, Vitest and Playwright and says anything else is asked
for first. Three packages were installed that are not literally on that list, and the reasoning is
recorded here so the team can overrule it:

| Package | Why it was treated as part of an approved tool |
| --- | --- |
| `@playwright/test` | This **is** Playwright's package name. There is no package called `playwright-test` to install instead. |
| `@vitest/coverage-v8` | Vitest's own v8 coverage provider, published by the Vitest team in the Vitest repository. `CLAUDE.md` names `npm run test:coverage # Vitest with v8 coverage` as a required script, which cannot run without it. |
| `@eslint/js` | ESLint's own package, published by the ESLint team. It is how flat config reaches `js.configs.recommended`, which is where `no-undef` and `no-unused-vars` come from. |

**One package was deliberately not installed:** `globals`, which is the usual way a flat config
declares browser and Node globals. It is a third-party package rather than an ESLint one, so the
globals are declared by hand in `eslint.config.js` instead. The cost is a short list to maintain when
a new browser global is used.

### What the toolchain looked like once there was a front end: 2026-08-30, issue #62

Three small findings, all of them from running the tools rather than from configuring them.

**Prettier broke NFR-02 on a file that was compliant when it was written.** The delivered
`board.css` was 248 lines. `npm run format` expands a rule such as
`.square[data-square="0"] { grid-area: 5 / 1; }` into three lines, and there is no option to keep it
on one, so the file came out at 407. The 40 track placements were split into `board-track.css` to get
back under the limit. **Two rules that are each sensible on their own, "format everything" and "no
file over 300 lines", disagreed on a real file**, and that is worth a sentence in the report: the
formatter is not neutral with respect to the other constraints.

**The 300-line check had been counting the wrong files.** The command in
[09-source-code-overview.md](09-source-code-overview.md) listed `*.js` only. NFR-02 says source,
tests and config, and a stylesheet is source. The command now lists `*.css` too, and the longest file
in the project turns out to be one.

**One ESLint entry was added, for one file by name.** `scripts/design-screenshots.js` runs in Node
but hands callbacks to `page.evaluate`, which Playwright serialises and runs inside the browser, so
`document` is genuinely in scope there. It is listed by name rather than by directory, so an ordinary
Node script under `scripts/` still fails if it reaches for a DOM. The rule was loosened for the one
file that has a reason, not for the folder.

**Vite needed no configuration for the stylesheets.** `main.js` imports the six CSS files and the
build bundles them into one asset. Nothing was added to `vite.config.js`.

### One script added and one directory ignored: 2026-08-30, issue #30

**`npm run test:seeds` is a twelfth script, and it is not in CLAUDE.md's binding list.** It runs
`scripts/find-seeds.js`, which replays matches headlessly to find the seeds the end-to-end suite
plays on. It is in `package.json` rather than left as a `node scripts/...` invocation for one reason:
the seeds go stale whenever a change alters what the injected RNG is spent on, and a command nobody
can find is a command nobody re-runs. The reasoning behind the script is in
[08-quality.md](08-quality.md).

The binding list in CLAUDE.md is a **minimum** and this adds to it rather than replacing anything, so
no negotiation was needed. Worth noting in the report all the same: the specification was written
before the project had a script that generates test inputs, and this is the first script whose output
is committed data rather than a build artefact.

**`01-Design/**` is now ignored by ESLint, and the reason matters more than the line.** Claude Design
drops a generated canvas runtime next to every `.dc.html` board it delivers, `support.js` and
`_ds_bundle.js`, several thousand lines each and marked "do not edit" by the tool that wrote them.
The card artwork handoff arrived with three of them, and `npm run lint` went from clean to **306
errors, none of them in project code**. Nothing under `01-Design/` is built or shipped:
`01-Design/README.md` is explicit that the CSS lands in `src/ui/styles/` instead.

The general point for the report: **a lint run that reports on somebody else's generated code is a
lint run people learn to ignore**, and that is the failure mode worth avoiding, not the 306 errors.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- ~~No `package.json`, no ESLint config, no Prettier config and no Vite config exist yet. Everything
  above is target state, not observation.~~ **Resolved 2026-08-29, issue #63.** All of them exist and
  every script except `test:e2e` has been run. See *Toolchain bootstrapped* above.
- No deployment target has been chosen. `Brainstorming.md` floats GitHub Pages or itch.io for
  playable build artifacts; nothing is decided. **Unchanged by the bootstrap**, and it stays cheap to
  defer: `npm run build` produces a plain static `dist/`, which any static host serves.
- **Whether JSDoc is enforced through ESLint is undecided, and the bootstrap deliberately did not
  decide it.** No `eslint-plugin-jsdoc` is installed, because that would be a sixth dev dependency
  and `CLAUDE.md` requires asking first. What exists instead is a convention rather than a check:
  every exported function in `src/` carries a block comment saying what it does and, where a number
  comes from the rulebook, which section of the game design document it comes from. The report should
  call that a convention and not a gate.
- **`npm run test:e2e` has never been run.** There is no spec in `tests/e2e/` yet, so the command
  would report "no tests found", and the Playwright browsers have not been downloaded
  (`npx playwright install`). Both land with the board view.
- **`npm run docs:ai-index` has never been run either**, for the reason in *Two things added* above:
  the prompt log is per machine, so a run here would generate an incomplete Chapter 13.
- ~~The `gh` CLI is not installed on the development machine and no GitHub token is configured, so no
  *authenticated* GitHub automation can run locally.~~ **Half of this was wrong: corrected
  2026-08-06.** The `gh` CLI is indeed absent, but a token was already present and neither
  `GITHUB_TOKEN` nor `GH_TOKEN` was the place to look for it:
  - `credential.helper` is set to `manager` (Git Credential Manager). `git credential fill` against
    `host=github.com` returns its stored token, which authenticates as `lbolender` with scopes
    `gist, repo, workflow`.
  - That is sufficient for **authenticated repository writes**: issues were commented on and closed
    through the REST API with it on 2026-08-06, with no new tooling installed.
  - It is **not** sufficient for the Projects v2 board: GraphQL answers `INSUFFICIENT_SCOPES` and
    names `read:project` as the missing scope. Adding that one scope to the existing token removes the
    need for the unstable `memex-*` HTML-parsing route described in
    [02-project-management.md](02-project-management.md#board-access-from-the-development-environment).
  - **The generalisable lesson**, and the reason this is written down rather than quietly fixed: the
    absence of an environment variable was read as the absence of a credential. On Windows the
    credential normally lives in the credential manager, not the environment, so "no token" should be
    tested by asking the credential helper, not by checking `env`. The same mistake in the opposite
    direction as the MCP finding below: both times an integration that was present looked absent
    because the wrong location was checked.
- **MCP servers are per-client, not per-editor.** The GitHub MCP server was installed into
  `%APPDATA%\Code\User\mcp.json`: VS Code's own registry, used by Copilot. Claude Code reads
  `.mcp.json` in the project root, `mcpServers` in `~/.claude.json`, or entries added via
  `claude mcp add`, and saw nothing. Both tools run in the same editor, which is exactly why the
  mistake is easy to make. If the team wants the server available to Claude Code as well, adding it
  to a committed `.mcp.json` makes it work for all three members at once rather than per machine.
- Before submission, `npm run lint` and the formatter check must be demonstrably green, and the run
  commands in the README must actually work. Record the evidence here when that is verified.
