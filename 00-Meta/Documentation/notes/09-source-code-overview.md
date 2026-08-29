# 09 Source code overview

> **Covers:** the size and shape of the codebase in numbers.
> **This is the only chapter where numbers live.** Line counts, file counts, test counts and
> coverage percentages appear here and nowhere else.

## The rule

Every number in this file is stored **next to the command that produces it**, and is only ever
written down after that command has actually been run. Never estimate, never recall from memory,
never copy a figure from an earlier draft.

The reason is that a number goes stale silently. A line count written into a chapter in week three
is quietly wrong by week five and nothing flags it. A command is never wrong: it is re-run before
submission and the output replaces whatever was there.

The other chapters therefore never state a figure. They refer here.

**Values are replaced, not appended.** When a command is re-run, its new output overwrites the old
one and the *Taken on* column moves with it. The point of this table is what is true now, not a
history of what was true.

## Commands

Run from the repository root, in Git Bash. Every command below has been executed; two of the ones
suggested when this file was first written did not work and were corrected, which is noted under
each of them.

```bash
# 1. Source files and lines, excluding tests
git ls-files 'src/*.js' | xargs wc -l | tail -1

# 2. Test files and lines
git ls-files 'tests/*.js' | xargs wc -l | tail -1

# 3. Lines per architecture layer
for d in src/core src/state src/ui src/i18n; do
  printf '%s ' "$d"
  n=$(git ls-files "$d/*.js" | wc -l)
  if [ "$n" -eq 0 ]; then echo "0 files"; else git ls-files "$d/*.js" | xargs wc -l | tail -1; fi
done

# 4. Unit test count
npx vitest run --reporter=default 2>&1 | grep -E "Test Files|Tests "

# 5. Coverage
npm run test:coverage

# 6. Longest files: evidence for the 300-line rule
git ls-files '*.js' | xargs wc -l | sort -rn | sed -n '2,6p'
```

**Two corrections to the commands this file was created with**, both found by running them:

- The original pattern was `git ls-files 'src/**/*.js'`, which returns **nothing**. Git pathspecs are
  not shell globs: a plain `*` already matches across `/`, and `**` is not treated the way a shell
  treats it here. `src/*.js` is the working form and it does recurse.
- The original test-count command was `npx vitest run --reporter=basic`. The `basic` reporter was
  **removed in Vitest 4**, and the command fails with `Failed to load custom Reporter from basic`.
  `--reporter=default` plus a `grep` for the summary lines replaces it.

Command 6 uses `sed -n '2,6p'` rather than `head` because `wc -l` puts its `total` line first after
the reverse sort, and that total is not a file.

## Results

| Metric | Command | Value | Taken on |
| --- | --- | --- | --- |
| Source lines in `src/` | 1 | 26 lines in 1 file (`src/main.js`) | 2026-08-29, bootstrap (#63) |
| Test lines in `tests/` | 2 | 10 lines in 1 file (`tests/unit/smoke.test.js`) | 2026-08-29, bootstrap (#63) |
| Lines in `src/core/` | 3 | 0 files | 2026-08-29, bootstrap (#63) |
| Lines in `src/state/` | 3 | 0 files | 2026-08-29, bootstrap (#63) |
| Lines in `src/ui/` | 3 | 0 files | 2026-08-29, bootstrap (#63) |
| Lines in `src/i18n/` | 3 | 0 files | 2026-08-29, bootstrap (#63) |
| Unit tests | 4 | 1 test file, 1 test, both passing | 2026-08-29, bootstrap (#63) |
| Coverage of `src/core/` and `src/state/` | 5 | **No files to measure.** v8 reports `0/0` and prints `Unknown%` | 2026-08-29, bootstrap (#63) |
| Longest JavaScript file | 6 | 143 lines, `eslint.config.js` | 2026-08-29, bootstrap (#63) |

Longest-file ranking in full, from command 6, same run:

| Lines | File |
| --- | --- |
| 143 | `eslint.config.js` |
| 131 | `scripts/docs-ai-index.js` |
| 45 | `playwright.config.js` |
| 26 | `src/main.js` |
| 25 | `vitest.config.js` |

## Interpretation

- **26 lines of source is the whole application.** That is the honest state of the repository on
  2026-08-29: the toolchain runs, and there is no game. Every figure above will be replaced within
  days, and it is recorded anyway, because the first measurement is the only one that shows where the
  project started measuring.
- **The two longest files are configuration, not code**, and the longest of them is `eslint.config.js`
  at 143 lines, comfortably under the 300-line limit of NFR-02. Nearly half of it is the two rules
  that enforce the layering, which is a fair trade: the config is the thing that keeps the source
  files small.
- **The coverage figure does not exist yet, and it is written as not existing.** v8 reports `0/0` and
  `Unknown%` because `src/core/` and `src/state/` contain no files. The 80 % threshold is configured
  in `vitest.config.js` and is not triggered by an empty file set, so `npm run test:coverage` passes
  today for a reason that has nothing to do with quality. That is worth knowing before anybody quotes
  a green run as evidence.
- **The one test is a smoke test and proves only the runner.** Chapter 08 says so as well. It is not
  counted toward anything.

The longest-file figure is worth carrying because the 300-line limit is a stated project
constraint; showing the actual maximum is the cheapest possible proof that it held.
