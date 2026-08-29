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

# 5a. Coverage totals
npm run test:coverage

# 5b. Coverage per file, which command 5a cannot show (see the correction below)
node -e "const j=require('./coverage/coverage-summary.json');
for (const [k,v] of Object.entries(j))
  console.log(k.split(/[\\\\/]/).slice(-3).join('/') + ' lines ' + v.lines.pct + '%');"

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

**A third correction, and this one is a measured defect rather than a typo.** `npm run
test:coverage` prints correct totals and an **empty per-file table**: the header and the separator
lines render, and there is not one row between them. So the per-directory figure NFR-05 actually
asks for cannot be read off the terminal at all. The workaround is command 5b: `json-summary` was
added to the coverage reporters in `vitest.config.js`, and the per-file numbers are read out of
`coverage/coverage-summary.json`, where they are correct. Worth carrying into the report as a small
example of the difference between a metric being *produced* and a metric being *readable*.

## Results

| Metric | Command | Value | Taken on |
| --- | --- | --- | --- |
| Source lines in `src/` | 1 | **184 lines in 2 files** | 2026-08-29, after #26 |
| Test lines in `tests/` | 2 | **211 lines in 2 files** | 2026-08-29, after #26 |
| Lines in `src/core/` | 3 | 158 lines in 1 file (`board.js`) | 2026-08-29, after #26 |
| Lines in `src/state/` | 3 | 0 files | 2026-08-29, after #26 |
| Lines in `src/ui/` | 3 | 0 files | 2026-08-29, after #26 |
| Lines in `src/i18n/` | 3 | 0 files | 2026-08-29, after #26 |
| Unit tests | 4 | **2 test files, 28 tests, all passing** | 2026-08-29, after #26 |
| Coverage of `src/core/` and `src/state/`, lines | 5a | **100 % (35/35)** | 2026-08-29, after #26 |
| Coverage of `src/core/board.js`, lines | 5b | **100 % (35/35)** | 2026-08-29, after #26 |
| Coverage, branches | 5a | 100 % (28/28) | 2026-08-29, after #26 |
| Longest JavaScript file | 6 | **201 lines, `tests/unit/core/board.test.js`** | 2026-08-29, after #26 |

Longest-file ranking in full, from command 6, same run:

| Lines | File |
| --- | --- |
| 201 | `tests/unit/core/board.test.js` |
| 158 | `src/core/board.js` |
| 143 | `eslint.config.js` |
| 131 | `scripts/docs-ai-index.js` |
| 45 | `playwright.config.js` |
| 33 | `vitest.config.js` |

For comparison, the same table taken a few hours earlier at the bootstrap commit, before any rules
existed: 26 source lines in 1 file, 10 test lines in 1 file, 1 test, no coverage measurable at all,
longest file `eslint.config.js` at 143 lines. It is kept as one sentence rather than a second table,
because the rule of this chapter is that values are replaced.

## Interpretation

- **184 lines of source is still not a game.** One module exists, `core/board.js`, and it is the
  coordinate system everything else is computed on. What the figure does show is where the project
  started measuring, which is 2026-08-29, 23 days after the repository was created.
- **The test file is longer than the code it tests**, 201 lines against 158, and that ratio is
  expected here rather than a warning sign. `board.js` is arithmetic with sharp boundaries at
  `r = 0`, `52`, `53`, `57` and `58`, and most of the test file is boundary cases and two exhaustive
  loops that check a property across all four players rather than at one sample point.
- **100 % line coverage of `src/core/` against a floor of 80 % (NFR-05).** The number is worth
  exactly as much as the case list behind it, which is why Chapter 08 keeps that list separately: a
  module of pure arithmetic reaching 100 % is not evidence of much on its own. What it does prove is
  that the measurement works, which the bootstrap run could not.
- **The longest file is 201 lines against the 300-line limit of NFR-02**, and it is a test file. The
  limit applies to tests as well, which is the constraint most likely to bite first: a rule module
  with many edge cases produces a test file two or three times its own size.
- **`src/state/`, `src/ui/` and `src/i18n/` are still empty**, so the coverage figure covers one
  layer of the two NFR-05 names. Quoting "100 % coverage" without that sentence would be misleading.

The longest-file figure is worth carrying because the 300-line limit is a stated project
constraint; showing the actual maximum is the cheapest possible proof that it held.
