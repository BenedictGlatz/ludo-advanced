# 09 Source code overview

> **Covers:** the size and shape of the codebase in numbers.
> **This is the only chapter where numbers live.** Line counts, file counts, test counts and
> coverage percentages appear here and nowhere else.

## The rule

Every number in this file is stored **next to the command that produces it**, and is only ever
written down after that command has actually been run. Never estimate, never recall from memory,
never copy a figure from an earlier draft.

The reason is that a number goes stale silently. A line count written into a chapter in week three
is quietly wrong by week five and nothing flags it. A command is never wrong — it is re-run before
submission and the output replaces whatever was there.

The other chapters therefore never state a figure. They refer here.

## Commands

Nothing to run yet — there is no source code. When `src/` exists, record each metric as a command
plus its last output and the date it was taken.

Suggested starting set, to be adjusted once the project is bootstrapped:

```bash
# Source files and lines, excluding tests
git ls-files 'src/**/*.js' | xargs wc -l | tail -1

# Test files and lines
git ls-files 'tests/**/*.js' | xargs wc -l | tail -1

# Lines per architecture layer
for d in src/core src/state src/ui src/i18n; do
  printf '%s ' "$d"; git ls-files "$d" | xargs wc -l | tail -1
done

# Unit test count
npx vitest run --reporter=basic

# Coverage
npm run test:coverage

# Longest files — evidence for the 300-line rule
git ls-files 'src/**/*.js' | xargs wc -l | sort -rn | head -10
```

## Results

| Metric | Command | Value | Taken on |
| --- | --- | --- | --- |
| — | — | — | — |

## Interpretation

Each figure needs one sentence saying what it tells you about the project. A distribution across
layers, for instance, is evidence for or against the claim that rules and presentation are actually
separated — if `core/` is tiny and `ui/` is enormous, the layering is nominal and the report should
admit it.

The longest-file figure is worth carrying because the 300-line limit is a stated project
constraint; showing the actual maximum is the cheapest possible proof that it held.
