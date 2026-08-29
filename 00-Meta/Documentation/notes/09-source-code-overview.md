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

Run from the repository root, in Git Bash. Every command below has been executed. Four of the ones
suggested when this file was first written turned out to be wrong and were corrected, which is
noted under them.

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

# 5b. Coverage per file, including the files command 5a leaves out (see the correction below)
node -e "const j=require('./coverage/coverage-summary.json');
for (const [k,v] of Object.entries(j))
  console.log((k === 'total' ? k : 'src' + k.split('src').pop()) + ' lines ' + v.lines.pct + '%');"

# 5c. Coverage per directory, which is what NFR-05 actually asks for
node -e "const j=require('./coverage/coverage-summary.json'); const a={};
for (const [k,v] of Object.entries(j)) { if (k === 'total') continue;
  const d = k.includes('core') ? 'src/core' : 'src/state';
  a[d] = a[d] || {c:0,t:0,f:0}; a[d].c += v.lines.covered; a[d].t += v.lines.total; a[d].f += 1; }
for (const [d,x] of Object.entries(a))
  console.log(d, x.f + ' files', x.c + '/' + x.t, (100*x.c/x.t).toFixed(2) + '%');"

# 6. Longest files: evidence for the 300-line rule
git ls-files '*.js' | xargs wc -l | sort -rn | sed -n '2,7p'
```

**Two corrections to the commands this file was created with**, both found by running them:

- The original pattern was `git ls-files 'src/**/*.js'`, which returns **nothing**. Git pathspecs are
  not shell globs: a plain `*` already matches across `/`, and `**` is not treated the way a shell
  treats it here. `src/*.js` is the working form and it does recurse.
- The original test-count command was `npx vitest run --reporter=basic`. The `basic` reporter was
  **removed in Vitest 4**, and the command fails with `Failed to load custom Reporter from basic`.
  `--reporter=default` plus a `grep` for the summary lines replaces it.

Command 6 uses `sed -n '2,7p'` rather than `head` because `wc -l` puts its `total` line first after
the reverse sort, and that total is not a file.

**A third correction to command 5b itself.** Its first version split the file path on
`/[\\\\/]/` and took the last three segments, which left the full Windows path in the output
untouched. Splitting on the literal string `src` and rebuilding the path from there works and is
readable, which is all this command has to be.

**A fourth correction, and this one withdraws an earlier claim rather than fixing a typo.** After
issue #26 this file recorded that `npm run test:coverage` printed an **empty per-file table** and
called it a measured defect in the tool. **That was wrong, and the cause is worth writing down.**
The v8 text reporter omits files that are at 100 %. At #26 there was exactly one measured file,
`board.js`, and it was at 100 %, so its row was omitted and the table looked broken. After #27
there are ten measured files, one of them below 100 %, and that one row renders correctly. The
other nine are still omitted, which is the same behaviour and now obviously deliberate.

The workaround stands and is still worth having: `json-summary` is in the coverage reporters in
`vitest.config.js`, and commands 5b and 5c read `coverage/coverage-summary.json`, which reports
every file whatever its percentage and can be aggregated per directory the way NFR-05 asks. What
changes is the reason. It is a reporting default that hides good news, not a defect.

The lesson is worth a sentence in the report on its own: a measurement taken once, against a sample
of one, produced a confident and wrong conclusion about a tool.

## Results

| Metric | Command | Value | Taken on |
| --- | --- | --- | --- |
| Source lines in `src/` | 1 | **1294 lines in 12 files** | 2026-08-29, after #64 |
| Test lines in `tests/` | 2 | **1717 lines in 14 files** | 2026-08-29, after #64 |
| Lines in `src/core/` | 3 | 656 lines in 6 files | 2026-08-29, after #64 |
| Lines in `src/state/` | 3 | 533 lines in 4 files | 2026-08-29, after #64 |
| Lines in `src/ui/` | 3 | 0 files | 2026-08-29, after #64 |
| Lines in `src/i18n/` | 3 | 79 lines in 1 file, plus 76 lines of locale JSON | 2026-08-29, after #64 |
| Unit tests | 4 | **13 test files, 157 tests, all passing** | 2026-08-29, after #64 |
| Coverage of `src/core/` and `src/state/`, lines | 5a | **99.53 % (216/217)** | 2026-08-29, after #64 |
| Coverage of `src/core/`, lines | 5c | **99.24 % (130/131) over 6 files** | 2026-08-29, after #64 |
| Coverage of `src/state/`, lines | 5c | **100 % (86/86) over 4 files** | 2026-08-29, after #64 |
| Coverage, branches | 5a | 99.38 % (161/162) | 2026-08-29, after #64 |
| The one file below 100 % lines | 5b | `src/core/movement.js`, 97.61 % | 2026-08-29, after #64 |
| Longest JavaScript file | 6 | **206 lines, `src/core/movement.js`** | 2026-08-29, after #64 |
| Files measured for coverage | 5b | **10 of the 12 files in `src/`** | 2026-08-29, after #64 |

Longest-file ranking in full, from command 6, same run:

| Lines | File |
| --- | --- |
| 206 | `src/core/movement.js` |
| 203 | `tests/unit/state/turn-manager.test.js` |
| 201 | `tests/unit/core/board.test.js` |
| 186 | `tests/unit/core/movement.test.js` |
| 178 | `src/state/turn-manager.js` |
| 160 | `tests/unit/state/intents.test.js` |

For comparison, the same table taken earlier the same day: at the bootstrap commit, 26 source lines
in 1 file, 10 test lines in 1 file, 1 test, no coverage measurable at all; after #26, 184 source
lines in 2 files, 211 test lines in 2 files, 28 tests, 100 % coverage of 35 lines. Kept as one
sentence rather than three tables, because the rule of this chapter is that values are replaced.

## Interpretation

- **1294 lines of source is a playable rule set with no way to play it.** Six modules of rules, four
  of state and the i18n setup exist, and every one of them runs in Node with no browser. `src/ui/`
  is still empty, so there is nothing on screen at all. Quoting the coverage figure without that
  sentence would be misleading, and so would quoting the build size: `npm run build` produces well
  under a kilobyte, because `main.js` still imports nothing.
- **There are more test lines than source lines**, 1717 against 1294. That ratio is expected for this
  kind of code rather than a warning sign: the rules have sharp boundaries at `r = 0`, `52`, `53`,
  `57` and `58`, and several tests are exhaustive loops over a whole domain instead of one sample
  point. The largest single test is a complete scripted match, 87 turns from the first draw to the
  win.
- **99.24 % of `src/core/` and 100 % of `src/state/` against a floor of 80 % (NFR-05).** Both
  directories now have real code in them, which the figure after #26 could not claim.
- **Two of the twelve files in `src/` are not measured at all**, and this is the sentence that has to
  go next to the coverage figure. `vitest.config.js` includes only `src/core/**` and `src/state/**`,
  because those are the two directories NFR-05 names. `src/main.js` and `src/i18n/index.js` are
  therefore outside the measurement. `i18n/index.js` **is** tested, by
  `tests/unit/i18n/locales.test.js`; it simply does not appear in the number. The configuration was
  left alone rather than widened, because widening it would quietly change what the NFR-05 figure
  means.
- **One line in the whole of `src/` is uncovered, and it is unreachable on purpose.**
  `movement.js` line 150 returns the generic refusal reason when every one of a player's pawns is
  already home. That state means the player has won and the match has ended, so no turn is ever
  evaluated in it. The line stays because it stops `blocked[0]` being read from an empty array, and
  it is recorded here rather than removed or excluded from the measurement.
- **The longest file is 206 lines against the 300-line limit of NFR-02**, and for the first time it
  is a source file rather than a test. `src/core/movement.js` is at 69 % of the limit with the
  movement rules complete, which is the first real evidence that the limit and the module split are
  compatible.
- **Exactly one branch in the whole of `src/` is uncovered, and it is the same unreachable line.**
  The first measurement after #27 reported four, and the other three turned out to be real gaps
  rather than unreachable code: the freeze path for a move that captures something, and the refusal
  of `select-pawn` for a pawn with no move. Two tests were added and the branch figure moved from
  97.53 % to 99.38 %. That is the coverage number doing the job it is for, which the line figure
  alone would not have done: lines were already at 99.53 % with all three gaps still open.

The longest-file figure is worth carrying because the 300-line limit is a stated project
constraint; showing the actual maximum is the cheapest possible proof that it held.
