# Implementation plan 15: the line-up screen, from the design spec to a playable menu

**Author:** Claude Code
**Date:** 2026-09-05
**Read against:** `2d01e73`, on branch `feature/82-bot-card-tactics`. Every line number and every line
count below is that tree
**Issue:** #76, the setup screen with bots on it. Requirement FR-43, and FR-01 for the lower bound of
one person
**Waits on:** `01-Design/Handoff/15-spec-bot-setup-menu.md`, the answer to
`15-brief-bot-setup-menu.md`, D90 to D96

> **Nothing in this plan is executed before the spec is in the repository.** Six of the eleven steps
> below have a line in them that reads "as the spec says", and building them on a guess is how a
> stylesheet ends up styling markup that does not exist. What can be done before the spec lands is
> **step 1 alone**, and it is written so that it is worth doing either way.

---

## 0 What is being built, in one paragraph

Today the only way to play against the computer is to type `?bots=3` into the address bar. After this
work the route is: main menu, then the player count, then a new **line-up screen** that says for each
seat of the match whether a person or the computer plays it, then the match. The rules underneath
already exist: `startMatch` has taken a list of bot seats since issue #43 and the whole `src/ai/` layer
is built and tested. **This is a menu, not a feature.** No file in `core/` and no file in `ai/` is
touched by any step below.

---

## 1 The two decisions taken before the design was asked

Both were taken with the Product Owner on 2026-09-05 and both are recorded in § 0 of the brief.

| Decision | What it means for the code |
| --- | --- |
| The screen comes **after** the player count | `OVERLAY_ACTION.PLAYERS` stops starting a match and starts opening a screen instead. That is the single most invasive line in this plan, and § 6 counts the tests it breaks |
| The choice is **per seat**, not a count | The screen produces a **list of seat numbers**, which is exactly what `startMatch` already takes. `botSeatsFor` is not used by this route at all, and it stays for the `?bots=` route |

**There is no mode switch.** "Single player" is a line-up with one person in it and "multiplayer" is a
line-up with two. Nothing in the code will know the difference, and whether the screen says the words
is D96.

---

## 2 Where the half-made line-up lives, and why

**It is view state, and it never enters the game state.** The same argument `match-flow.js` makes about
the screen in its own header: the rules know nothing about a menu, and `createGameState` has no field
for a match that has not started. A player who is halfway through setting up a line-up has not started
a match, so there is nothing for `state/` to hold.

So it lives in `ui/`, in a small object of its own, and `match-flow.js` owns it the way it owns the
screen.

**Rejected: a `pendingBots` array as two more closure variables in `match-flow.js`.** It is the obvious
thing and it is the wrong place by thirteen lines: that file is at **287 of the 300-line NFR-02
limit**. More important than the count, the toggle rule ("you may not turn the last person into a bot")
is a rule, and a rule inside a closure in the file that also owns the loop, the pool and the state
cannot be unit tested without booting jQuery.

**Rejected: putting the toggle rule in `session-actions.js`.** Its own header says neither of its
functions touches a variable, and that promise is what made it splittable from `match-flow.js` in the
first place. Breaking it for this would be spending a good seam on a menu.

**Rejected: a `lineup` field on the frozen game state.** It would make `core/` hold a fact about a
button, which is the thing D38 and this file's neighbours have refused four times now.

---

## 3 The two rules that are new, and where each one goes

| Rule | Layer | File | Why there |
| --- | --- | --- | --- |
| **Which seats a line-up may still change**: a seat that is the last person cannot become a bot (FR-01) | `state/` | `src/state/bots.js` | It is a rule about who is playing, which is the sentence that file's header already uses to explain why `botSeatsFor` lives there. It is pure, it takes two arrays, and it is a unit test |
| **What the half-made line-up currently is**, and what a click on a row does to it | `ui/` | `src/ui/lineup.js`, new | It is one screen's working memory. It holds no jQuery, so it is a unit test as well |

`state/bots.js` is at 109 lines and has room. The two new functions take **plain arrays** (`seats`,
`bots`) rather than a `state`, unlike `isBot` and `humanSeats` one function above them, and the reason
goes in the comment: there is no state yet. That asymmetry is worth a sentence in the file, because it
is the kind of thing that gets "tidied up" later by someone who has not noticed there is no match.

---

## 4 The steps, in order, one commit each

Every step carries the five mandatory per-change steps from `CLAUDE.md`. § 7 lists what each one owes
the documentation so it is not rediscovered eleven times.

### Step 1. Make room in `match-flow.js` (does not wait on the spec)

`match-flow.js` is at 287 of 300 lines and this feature adds roughly fifteen. The seam is
**`poolCounts()`**, lines 84 to 96: it is a pure function of `deps` that answers a question about the
pool overview, and it is the only thing in that file that is not about owning the session.

- Move it to `src/ui/pool-screen.js` as `poolCountsFor(deps)`, which is where the screen it feeds
  already lives. That file is small and it already imports `POOL_SIZE`.
- `match-flow.js` calls `poolCountsFor(deps)` and loses about fourteen lines including the comment,
  which goes with the function rather than being deleted.
- Unit test: `poolCountsFor` with a stub source, and `null` when there is no match. It is currently
  covered only through Playwright.

**Commit:** `refactor(ui): move the pool counts next to the screen that shows them`

### Step 2. The vocabulary (needs D90, D91, D94 for the names)

`src/ui/overlay-vocabulary.js`:

- `OVERLAY_SCREEN.LINEUP: "lineup"`, or whichever word the spec picks. Seventh screen.
- `OVERLAY_ACTION.CONTROLLER: "controller"`, the click on one seat row.
- `OVERLAY_ACTION.BEGIN: "begin"`, the Start button, if D94.1 confirms there is one.
- `OVERLAY_ACTION.BACK: "back"`, if D94.2 says there is one.

**If D90.2 says the line-up is S2 grown rather than a new screen**, this step shrinks to the two
actions and no new screen value, and steps 5 and 6 change shape. It is the one answer that reshapes the
plan rather than filling a blank in it.

**Commit:** folded into step 5, since a table of names with no reader is not a change worth its own
commit.

### Step 3. The rule in `state/` (does not wait on the spec)

`src/state/bots.js`, two functions and their tests:

```js
canBeBot(seats, bots, seat)        // false only for the last remaining person
toggleController(seats, bots, seat) // the new sorted bot list, unchanged when the toggle is refused
```

`toggleController` returns the list unchanged rather than throwing, because the caller is a click and a
refused click is a normal thing on a menu, not a programming error. `assertBotSeats` three functions
above is the one that throws, and it keeps that job.

Unit tests in `tests/unit/state/bots.test.js`: turning a person into a bot, turning a bot back, the
refusal on the last person, a two-seat match where the seats are 0 and 2 and not 0 and 1, and that the
result is sorted so `botSeatsFor`'s output and this one are the same shape.

**Commit:** `feat(state): let a line-up turn one seat into a bot and back`

### Step 4. The line-up's working memory (does not wait on the spec, except for D92)

`src/ui/lineup.js`, new, pure, no jQuery, no `t()`:

```js
createLineup()        // begin(playerCount), toggle(seat), snapshot()
```

`snapshot()` returns `{ playerCount, seats, bots }`, which is everything both the screen description and
`freshMatch` need, and nothing else.

**D92 is the one answer this step waits on**: what `begin(playerCount)` starts with. All people, or one
person and the rest bots. It is one line and it is a default a player will read as a recommendation, so
it is the spec's to make and not ours.

Unit tests in `tests/unit/ui/lineup.test.js`: the opening line-up for 2, 3 and 4 seats; a toggle;
the refused toggle; and that `begin` called a second time forgets the first line-up completely, because
a player who goes back to the count screen and picks a different number must not carry three bots into a
two-seat match.

**Commit:** `feat(ui): remember a half-made line-up between the count and the match`

### Step 5. The screen description (needs D91, D93, D94, D95, D96)

`src/ui/lineup-screen.js`, new, on the `menu-screen.js` and `pool-screen.js` precedent: pure, takes the
snapshot, returns a description, calls `t()`, and is unit tested by asking what it says.

It produces, per the DOM contract in § 5 of the brief:

- one row per seat, carrying `player`, `controller`, the label from `player-labels.js` and whether the
  row is locked (D93),
- the buttons the spec asks for: Start, and Back if there is one,
- the title and the sentences from D96.

`src/ui/overlay-screens.js` (148 lines) gains one `case` and a `lineup` argument on
`screenDescription`, the same way `pool` is threaded through today. The reasoning for a separate file
is already written in that file's header for the menu and the pool, so this is following a rule rather
than making one.

Unit tests in `tests/unit/ui/lineup-screen.test.js`: two, three and four seats produce that many rows;
the rows carry the right seat numbers (0 and 2 for a two-player match); a bot row is named "Bot 3" and
not "Bot 2"; the locked row is the one the rule says; and no label is an empty string, which is the
check `menu-screen.test.js` already makes for the hints.

**Commit:** `feat(ui): describe the line-up screen`

### Step 6. Rendering and events (needs D91 for the markup)

- `src/ui/overlay-view.js` (218 lines) gains a seat-row builder beside `overlayDoor`, told apart by the
  description carrying `seats`, the same way a door is told apart by carrying a `hint`. That file's
  promise is that it renders a description and knows nothing about screens, and this keeps it.
- `src/ui/events.js` line 215 currently passes `data-count` as the value. It becomes
  `$(this).attr("data-count") ?? $(this).attr("data-seat")`, one line, so a row's control can say which
  seat it is. `data-count` keeps its meaning because `overlay.css` line 196 selects on it.
- `focusOverlay` (`overlay-view.js` lines 213 to 215) changes **only if D94.3 says Start takes the
  keyboard** rather than the first row.
- The stylesheet the spec delivers is imported in `main.js` after `overlay.css`, next to `menu.css`.

**Commit:** `feat(ui): draw the line-up screen`

### Step 7. Wiring the flow (needs D90, D94)

- `src/ui/match-flow.js`: `freshMatch(playerCount, botSeats)` takes the list. The `?bots=` route keeps
  its clamp and its `botSeatsFor` call, and the comment there about `Math.min(bots, playerCount - 1)`
  stays true and stays where it is.
- Two new one-line functions: `openLineup(count)` and `beginFromLineup()`.
- `src/ui/session-actions.js`: `OVERLAY_ACTION.PLAYERS` opens the line-up instead of starting the match,
  `CONTROLLER` toggles a row and redraws, `BEGIN` starts the match, `BACK` returns to setup.

**This is the step that changes the meaning of an existing click**, and § 6 is the list of tests that
notice.

**Commit:** `feat(ui): choose who plays each seat before the match starts`

### Step 8. The strings (needs D96)

`src/i18n/locales/de/ui.json` and `en/ui.json`, in the **same commit**, because
`tests/unit/i18n/locales.test.js` compares the flattened key sets and a one-sided addition fails the
run. Provisional key list, to be replaced by whatever D96 names:

```
lineup.title, lineup.text, lineup.human, lineup.bot,
lineup.start, lineup.back, lineup.lastHuman
```

German is the default and the longer language, so the layout is checked against the German strings
first.

**Commit:** folded into step 6 or 7, whichever first renders a string.

### Step 9. The end-to-end spec (needs the screen to exist)

`tests/e2e/lineup.spec.js`, new, on the `menu.spec.js` precedent, because `match-flow.spec.js` is at
247 of 300 lines and this is a screen rather than a flow. Cases:

1. The count click opens the line-up and **does not** start a match.
2. A row can be switched to bot and back, and `data-controller` follows.
3. The last person's row refuses, in whichever way D93 picked.
4. Start begins a match whose HUD shows exactly the bots the screen said, read through
   `window.ludo.getLoop().getState().bots` with the atomic read `bot-helpers.js` explains.
5. Switching language on this screen rewrites every string, which is FR-34's criterion and the reason
   step 8 is not optional.

**Commit:** `test(e2e): cover the line-up screen`

### Step 10. Repairing the specs the new step breaks (needs step 7)

Six clicks in three files, listed in § 6.

**Commit:** folded into step 7, because a commit that leaves the suite red is worse than a large one.

### Step 11. The documentation and the changelog

Per `CLAUDE.md`, and § 7 says exactly what.

**Commit:** each step carries its own share. Nothing is left for the end.

---

## 5 What each design decision unblocks

Read this table the moment the spec lands, and if a row is unanswered, that step waits.

| Decision | Blocks | If it is not answered |
| --- | --- | --- |
| D90 screen or grown setup | Steps 2, 5, 7 | The plan's shape changes, not a blank in it. Ask again before building |
| D91 the row and its control | Steps 5, 6 | We would be inventing a component look, which `CLAUDE.md` forbids |
| D92 the opening line-up | Step 4 | Build with all seats human, which is the behaviour today's tests assume, and flag it as provisional |
| D93 the last person's refusal | Steps 5, 6, 9 | Buildable with the DOM `disabled` property on D77.2's precedent, flagged as provisional |
| D94 Start, Back, focus | Steps 2, 5, 6, 7 | A Start button is assumed. A missing Back is survivable; a missing Start is not, because nothing would begin the match |
| D95 may seat 0 be a bot | Steps 3, 5 | Build the permissive version, since the rule allows it and locking it later is a smaller change than unlocking it |
| D96 the words | Steps 5, 8 | Placeholder German that reads like the rest of the game, marked in the commit body as awaiting the spec |

---

## 6 What this breaks, named before it breaks

**Six clicks in three end-to-end specs expect a count button to start a match**, and after step 7 it
opens a screen instead. All six are ours to fix and none of them is a defect in the spec that wrote
them.

| File | Line | What it does |
| --- | --- | --- |
| `tests/e2e/match-flow.spec.js` | 47 | The shared `startMatch` helper. **Fixing this one fixes most of the others**, because the two below it use it |
| `tests/e2e/match-flow.spec.js` | 77, 224 | Two direct count clicks |
| `tests/e2e/handover.spec.js` | 28, 73 | Two-player matches started from the menu |
| `tests/e2e/dice-pool.spec.js` | 153 | One, in a spec about something else entirely |

The fix in every case is one added click on Start. **The sixteen specs that boot with `?players=` are
untouched**, which is what that option was kept alive for, and it is why this feature does not cost the
suite a rewrite.

Also affected, and smaller:

- `tests/unit/ui/overlay-screens.test.js` asserts the screen switch. A seventh case joins it.
- `src/ui/match-flow.js`'s header comment describes the flow. It changes, and the sentence "the count
  click starts the match" is no longer true anywhere in the file.

---

## 7 What each step owes the documentation

`CLAUDE.md`'s mandatory steps, resolved for this piece of work so nobody has to look it up eleven times.

| Step | Chapter note | Journal | Changelog |
| --- | --- | --- | --- |
| 1 | `notes/04-frontend-building-blocks.md` | The seam and why `poolCounts` was the one that moved | no |
| 3 | `notes/06-state-and-turn-flow.md` | Why the rule is in `state/` and takes arrays rather than a state | no |
| 4 | `notes/04-frontend-building-blocks.md` | Why the line-up is view state, with the three rejected alternatives from § 2 | no |
| 5, 6 | `notes/04-frontend-building-blocks.md` | Only if the spec's answer differs from what the brief expected | Added: the line-up screen |
| 7 | `notes/04-frontend-building-blocks.md` and `06-state-and-turn-flow.md` | The count click changing meaning, and the six broken specs as a challenge bullet if the repair cost more than half an hour | Changed: choosing a player count no longer starts the match immediately |
| 8 | `notes/04-frontend-building-blocks.md` | no | no |
| 9 | `notes/08-quality.md` | no | no |

**No number goes into any note except `notes/09-source-code-overview.md`**, and only after the command
that produces it has been run. The line counts in this plan are working notes for the person building
it, not documentation.

`01-Design/Handoff/00-open-requests.md` gets a status block when the spec lands, saying what handoff 15
answered and that D86 of brief 13 was retired by it.

---

## 8 Risks, and the one that is not small

1. **D90.2 would reshape this plan.** If the spec folds the line-up into S2 rather than adding a
   screen, steps 2, 5 and 7 are different work: one screen that redraws itself rather than two screens
   with a transition between them. It is not more work, it is other work, and the plan is re-read
   rather than followed.
2. **`tokens.css` is at 298 of 300 lines.** Any token the spec asks for needs the split named with it.
   The brief says so in its § 8, and if the spec asks anyway, the split happens before the token.
3. **The screen makes the menu route three clicks deep.** Menu, count, line-up, Start. That is the cost
   of the feature and it is worth writing in the journal at step 7, because it is the sort of thing a
   retrospective notices without remembering why it was chosen.
4. **`?bots=` and the screen can disagree.** They are two routes to the same match and only one of them
   is tested by the new spec. The mitigation is that both end at `startMatch(playerCount, deps, ...,
   botSeats)` with a list, so there is one code path below the two entry points and nothing to drift.

---

## 9 Definition of done

- The line-up screen is reachable from the main menu with no address bar, and a person can start a
  match against one, two or three bots from it.
- The last person cannot be turned into a bot, and the screen says so in whichever way the spec chose.
- `npm test` green, and `npm run test:coverage` still at or above 80 per cent lines in `core/`, `state/`
  and `ai/`. The two new pure modules are unit tested; `ui/` rendering is covered by Playwright as the
  layering intends.
- `npx playwright test` green, including the six repaired clicks.
- `npm run lint` and `npm run format` clean, and **no file over 300 lines**, checked after formatting.
- Both locales carry every new key, which `tests/unit/i18n/locales.test.js` proves.
- The notes, the journal and the changelog carry what § 7 lists, in the same commits as the code.
- Issue #76 closed from the commit body that finishes step 7.
