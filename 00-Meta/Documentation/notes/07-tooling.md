# 07 Tooling

> **Covers:** the developer toolchain — npm scripts, package management, linter, formatter, builds,
> deployment.
> **Does not cover:** tests and coverage, which are Chapter 08, even though they are run through
> npm scripts listed here.

## What this chapter must answer

- Every npm script, what it is for. A table.
- Package management: which dependencies are production and which are development, and the policy
  that governs adding one.
- Linter: which one, where configured, which plugins, which classes of error it catches.
- Formatter: which one, what it owns, and how the split with the linter is kept clean.
- JSDoc or equivalent documentation enforcement — whether it exists, and if not, why not.
- TypeScript — deliberately absent here, so it needs a stated reason.
- Dev build, production build, deployment. If there is no deployment, name that and say what the
  path would be.

Every one of these points appears even when the answer is "not used" — a deliberate omission with a
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

### Constraints that shape the toolchain

- **JavaScript only, no TypeScript.** No `.ts` files and no build-time type checking. The reason is
  not yet recorded and must be.
- **No file longer than 300 lines** — source, tests and config alike. When a file approaches the
  limit it is split along a real seam, not compressed by stripping whitespace or comments. This
  constraint is what makes the strict `core`/`state`/`ui` layering necessary rather than decorative,
  which is a point worth making in the report.
- **No hardcoded user-facing strings.** Every player-readable string goes through i18next.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- No `package.json`, no ESLint config, no Prettier config and no Vite config exist yet. Everything
  above is target state, not observation.
- No deployment target has been chosen. `Brainstorming.md` floats GitHub Pages or itch.io for
  playable build artifacts; nothing is decided.
- Whether JSDoc is enforced through ESLint is undecided.
- The `gh` CLI is not installed on the development machine and no GitHub token is configured, so no
  *authenticated* GitHub automation (board writes, issue creation, release notes) can run locally.
  Verified 2026-08-06. Reads work only because the repository and project were made public — see
  [02-project-management.md](02-project-management.md#board-access-from-the-development-environment)
  for the routes that do and do not work, and why the Projects v2 GraphQL API is not one of them.
- **MCP servers are per-client, not per-editor.** The GitHub MCP server was installed into
  `%APPDATA%\Code\User\mcp.json` — VS Code's own registry, used by Copilot. Claude Code reads
  `.mcp.json` in the project root, `mcpServers` in `~/.claude.json`, or entries added via
  `claude mcp add`, and saw nothing. Both tools run in the same editor, which is exactly why the
  mistake is easy to make. If the team wants the server available to Claude Code as well, adding it
  to a committed `.mcp.json` makes it work for all three members at once rather than per machine.
- Before submission, `npm run lint` and the formatter check must be demonstrably green, and the run
  commands in the README must actually work. Record the evidence here when that is verified.
