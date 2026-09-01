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

# 6. Longest files: evidence for the 300-line rule. CSS counts, so it is in the pattern.
git ls-files '*.js' '*.css' | xargs wc -l | sort -rn | sed -n '2,7p'

# 7. Stylesheet lines. Added 2026-08-30, when src/ui/styles/ stopped being empty.
git ls-files 'src/*.css' | xargs wc -l | sort -rn

# 8. End-to-end test count, per browser. The suite runs three, so the total run is three times this.
npx playwright test --list --project=chromium 2>&1 | tail -1
```

**Command 6 changed on 2026-08-30** and the change matters. It used to list `*.js` only. NFR-02
applies to "source, tests and config", and a stylesheet is source: the delivered `board.css` was the
first file in the project to come near the limit, and a JavaScript-only command would not have seen
it.

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

### Measured 2026-09-01, after issue #39

Every command in the section above was re-run. The figures below replace the 2026-08-31 set that follows
them, which is kept so that the growth is readable rather than asserted.

| Metric | Command | Value | Taken on |
| --- | --- | --- | --- |
| JavaScript lines in `src/` | 1 | **8996 lines in 61 files** | 2026-09-01, after #39 |
| Stylesheet lines in `src/` | 7 | **2136 lines in 14 files** | 2026-09-01, after #39 |
| Test lines in `tests/` | 2 | **8291 lines in 50 files** | 2026-09-01, after #39 |
| Lines in `src/core/` | 3 | 3645 lines in 27 files | 2026-09-01, after #39 |
| Lines in `src/state/` | 3 | 1809 lines in 10 files | 2026-09-01, after #39 |
| Lines in `src/ui/` | 3 | **3280 lines in 22 files**, plus 2136 lines of CSS | 2026-09-01, after #39 |
| Generated card artwork in `src/ui/art/` | 3 | 582 lines in 36 `.svg` files | 2026-09-01, after #39 |
| Unit tests | 4 | **36 test files, 527 tests, all passing** | 2026-09-01, after #39 |
| End-to-end tests | 8 | **60 tests in 12 files per browser, 180 across the three** | 2026-09-01, after #39 |
| Coverage of `src/core/` and `src/state/`, lines | 5a | **99.21 % (750/756)** | 2026-09-01, after #39 |
| Coverage of `src/core/`, lines | 5c | **99.59 % (490/492) over 27 files** | 2026-09-01, after #39 |
| Coverage of `src/state/`, lines | 5c | **98.48 % (260/264) over 10 files** | 2026-09-01, after #39 |
| Coverage, branches | 5a | 96.01 % (530/552) | 2026-09-01, after #39 |
| Coverage, functions | 5a | **100 % (272/272)** | 2026-09-01, after #39 |
| Files below 100 % lines | 5b | 5 of 37, unchanged: `cards/context.js` 90, `intents-cards.js` 96.22, `skill-play.js` 97.05, `intents.js` 97.61, `move-rules.js` 97.91 | 2026-09-01, after #39 |
| Longest file of any kind | 6 | **300 lines, `src/state/turn-manager.js`** | 2026-09-01, after #39 |
| Longest source file | 6 | 300 lines, `src/state/turn-manager.js` | 2026-09-01, after #39 |
| Longest stylesheet | 6 | 223 lines, `src/ui/styles/tokens.css` | 2026-09-01, after #39 |

**Three things in that table are worth a sentence each in the report.**

1. **`src/ui/` grew by 60 % and `src/core/` by 1 %.** Issue #39 added no rules: it added a HUD, five
   overlay screens, a chrome row and the card artwork. `pawnProgress` and `PLAYER_COUNTS` are the whole of
   the `core/` change, 37 lines. That split is the layering doing exactly what Chapter 05 claims for it.
2. **The longest file in the repository is now exactly 300 lines**, which is NFR-02's limit to the line.
   `turn-manager.js` has been at 295 since issue #38 and gained five when `nextSeat` was exported and
   documented. It is not a comfortable margin, and the next change to that file has to split it.
3. **Coverage went up while `ui/` grew by 1232 lines**, from 99.19 % to 99.21 %, and that is not an
   achievement: `ui/` is outside the measured set by design, so a sprint spent almost entirely in `ui/`
   cannot move the number much in either direction. The figure is honest and it is also close to
   meaningless for this particular sprint, which is the sort of thing a coverage number needs an
   interpretation for. What actually covers this sprint's work is the 18 new end-to-end tests.

### Measured 2026-08-31, after issues #37 and #38

Every command in the section above was re-run. The figures below replace the 2026-08-30 set that follows
them, which is kept so that the growth over two days of work is readable rather than asserted.

| Metric | Command | Value | Taken on |
| --- | --- | --- | --- |
| JavaScript lines in `src/` | 1 | **7710 lines in 51 files** | 2026-08-31, after #37 and #38 |
| Stylesheet lines in `src/` | 7 | **1623 lines in 11 files** | 2026-08-31, after #37 and #38 |
| Test lines in `tests/` | 2 | **7290 lines in 44 files** | 2026-08-31, after #37 and #38 |
| Lines in `src/core/` | 3 | 3608 lines in 27 files | 2026-08-31, after #37 and #38 |
| Lines in `src/state/` | 3 | 1778 lines in 10 files | 2026-08-31, after #37 and #38 |
| Lines in `src/ui/` | 3 | **2048 lines in 12 files**, plus the 1623 lines of CSS | 2026-08-31, after #37 and #38 |
| Unit tests | 4 | **34 test files, 503 tests, all passing** | 2026-08-31, after #37 and #38 |
| End-to-end tests | 8 | **42 tests in 9 files per browser, 126 across the three** | 2026-08-31, after #37 and #38 |
| Coverage of `src/core/` and `src/state/`, lines | 5a | **99.19 % (742/748)** | 2026-08-31, after #37 and #38 |
| Coverage of `src/core/`, lines | 5c | **99.59 % (483/485) over 27 files** | 2026-08-31, after #37 and #38 |
| Coverage of `src/state/`, lines | 5c | **98.48 % (259/263) over 10 files** | 2026-08-31, after #37 and #38 |
| Coverage, branches | 5a | 96.00 % (528/550) | 2026-08-31, after #37 and #38 |
| Coverage, functions | 5a | **100 % (266/266)** | 2026-08-31, after #37 and #38 |
| Files below 100 % lines | 5b | 5 of 37: `move-rules.js` 97.91, `cards/context.js` 90, `intents-cards.js` 96.22, `intents.js` 97.61, `skill-play.js` 97.05 | 2026-08-31, after #37 and #38 |
| Longest file of any kind | 6 | **299 lines, `tests/unit/state/intents-cards.test.js`** | 2026-08-31, after #37 and #38 |
| Longest source file | 6 | 295 lines, `src/state/turn-manager.js` | 2026-08-31, after #37 and #38 |
| Longest stylesheet | 6 | 221 lines, `src/ui/styles/card.css` | 2026-08-31, after #37 and #38 |

**What the numbers say, and it is worth one paragraph in the report.** The source tripled and the
coverage went **up**, from 99.55 % over 225 lines to 99.19 % over 748. The floor NFR-05 asks for is 80 %,
so there is a lot of room, and the reason there is room is the layering: `core/` and `state/` hold no DOM
and no clock, so every rule in the game is testable with literals.

**Two things the table does not say and should.** The longest file in the project is now a **test**, and
four files were split during these two issues purely to stay under 300 lines: `movement.js`,
`turn-manager.test.js`, `board-effects.test.js` and `intents-cards.test.js`. Each was split at a seam that
can be described in a sentence, which is recorded per split in Chapters 05, 06 and 08. And `ui/` has 2048
lines of JavaScript with **no unit tests at all**, by the decision in `vitest.config.js`; it is covered
by 42 Playwright cases instead.

### Measured 2026-08-30, after issue #62

| Metric | Command | Value | Taken on |
| --- | --- | --- | --- |
| JavaScript lines in `src/` | 1 | **2228 lines in 17 files** | 2026-08-30, after #62 |
| Stylesheet lines in `src/` | 7 | **821 lines in 6 files** | 2026-08-30, after #62 |
| Test lines in `tests/` | 2 | **2810 lines in 23 files** | 2026-08-30, after #62 |
| Lines in `src/core/` | 3 | 745 lines in 6 files | 2026-08-30, after #62 |
| Lines in `src/state/` | 3 | 548 lines in 4 files | 2026-08-30, after #62 |
| Lines in `src/ui/` | 3 | **748 lines in 5 files**, plus the 821 lines of CSS | 2026-08-30, after #62 |
| Lines in `src/i18n/` | 3 | 79 lines in 1 file, plus 76 lines of locale JSON | 2026-08-30, after #62 |
| Unit tests | 4 | **14 test files, 186 tests, all passing** | 2026-08-30, after #62 |
| End-to-end tests | 8 | **24 tests in 7 files per browser, 72 across the three** | 2026-08-30, after #62 |
| Coverage of `src/core/` and `src/state/`, lines | 5a | **99.55 % (224/225)** | 2026-08-30, after #62 |
| Coverage of `src/core/`, lines | 5c | **99.27 % (136/137) over 6 files** | 2026-08-30, after #62 |
| Coverage of `src/state/`, lines | 5c | **100 % (88/88) over 4 files** | 2026-08-30, after #62 |
| Coverage, branches | 5a | 99.35 % (153/154) | 2026-08-30, after #62 |
| The one file below 100 % lines | 5b | `src/core/movement.js`, 97.61 %, line 151 | 2026-08-30, after #62 |
| Longest file of any kind | 6 | **288 lines, `src/ui/styles/board.css`** | 2026-08-30, after #62 |
| Longest JavaScript file | 6 | 254 lines, `tests/unit/core/board.test.js` | 2026-08-30, after #62 |
| Files measured for coverage | 5b | **10 of the 17 JavaScript files in `src/`** | 2026-08-30, after #62 |

Longest-file ranking in full, from command 6, same run:

| Lines | File |
| --- | --- |
| 288 | `src/ui/styles/board.css` |
| 254 | `tests/unit/core/board.test.js` |
| 224 | `src/core/board.js` |
| 211 | `tests/unit/state/turn-manager.test.js` |
| 208 | `src/ui/board-geometry.js` |
| 207 | `src/core/movement.js` |

Stylesheets in full, from command 7, same run:

| Lines | File |
| --- | --- |
| 288 | `src/ui/styles/board.css` |
| 167 | `src/ui/styles/pawn.css` |
| 155 | `src/ui/styles/board-track.css` |
| 138 | `src/ui/styles/tokens.css` |
| 38 | `src/ui/styles/refusal.css` |
| 35 | `src/ui/styles/app.css` |

For comparison, the same table at three earlier points: at the bootstrap commit, 26 source lines in
1 file, 10 test lines in 1 file, 1 test, no coverage measurable at all; after #26, 184 source lines
in 2 files, 211 test lines in 2 files, 28 tests; after #64 on 2026-08-29, 1294 source lines in 12
files, 1717 test lines in 14 files, 157 tests and nothing on screen. Kept as one sentence rather
than four tables, because the rule of this chapter is that values are replaced.

## Interpretation

- **The game is playable, and 748 lines of `src/ui/` plus 821 of CSS is what that cost.** Every
  earlier version of this section had to say there was nothing on screen. There now is: `npm run
  test:e2e` plays a complete match through the browser, clicking pawns, in each of three engines.
- **`src/ui/` is now the largest layer by line count**, 748 against 745 for `src/core/` and 548 for
  `src/state/`, and with its stylesheets counted it is more than twice either of them. That is worth
  stating plainly next to the coverage figure, because **none of those 1569 lines is in the coverage
  measurement** (see below). The layer that is hardest to be sure about is the one that grew fastest.
- **There are more test lines than source lines**, 2810 against 2228 of JavaScript. That ratio is
  expected for this kind of code rather than a warning sign: the rules have sharp boundaries at
  `r = 0`, `40`, `41` and `44`, and several tests are exhaustive loops over a whole domain instead of
  one sample point. The largest single unit test is a complete scripted match, 65 turns from the
  first draw to the win, and the largest end-to-end test plays another one through the real interface
  in about 45 seconds per browser.
- **99.27 % of `src/core/` and 100 % of `src/state/` against a floor of 80 % (NFR-05).**
- **Seven of the seventeen JavaScript files in `src/` are not measured at all**, and this is the
  sentence that has to go next to the coverage figure. `vitest.config.js` includes only `src/core/**`
  and `src/state/**`, because those are the two directories NFR-05 names. `src/main.js`,
  `src/i18n/index.js` and all five files of `src/ui/` are therefore outside the measurement. Two of
  the seven **are** tested and simply do not appear in the number: `i18n/index.js` by
  `tests/unit/i18n/locales.test.js`, and `ui/board-geometry.js` by `tests/unit/ui/board-geometry.test.js`.
  The rest are covered by Playwright, which produces no percentage. The configuration was left alone
  rather than widened, because widening it would quietly change what the NFR-05 figure means.
- **One line in the measured code is uncovered, and it is unreachable by construction.**
  `movement.js` line 151 returns the generic refusal reason when every one of a player's pawns
  reports `ALREADY_HOME`. Since 2026-08-30 that needs all four pawns on `r = 44` at once, which the
  four-square house forbids, so it cannot happen in any legal board state. The line stays because it
  stops `blocked[0]` being read from an empty array, and it is recorded here rather than removed or
  excluded from the measurement.
- **The longest file in the project is now a stylesheet at 288 lines**, `src/ui/styles/board.css`,
  which is **96 % of the NFR-02 limit**. It got there without anybody writing 288 lines: the file was
  delivered at 248, and `npm run format` expanded every single-line rule into three. The 40 track
  placements were split out into `board-track.css` to bring it back under the limit, and what is left
  is still the closest any file has come. This is the number to watch: the next design revision that
  adds a state to a square pushes it over.
- **The longest JavaScript file is 254 lines**, a test. No source file is above 224.
- **Exactly one branch in the whole of `src/` is uncovered, and it is the same unreachable line.**
  The first measurement after #27 reported four, and the other three turned out to be real gaps
  rather than unreachable code: the freeze path for a move that captures something, and the refusal
  of `select-pawn` for a pawn with no move. Two tests were added and the branch figure moved from
  97.53 % to 99.38 %. That is the coverage number doing the job it is for, which the line figure
  alone would not have done: lines were already at 99.53 % with all three gaps still open.

The longest-file figure is worth carrying because the 300-line limit is a stated project
constraint; showing the actual maximum is the cheapest possible proof that it held.
