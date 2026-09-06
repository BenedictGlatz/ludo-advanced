# Skill Card Animations: the implementation plan

Written 2026-09-06 against `dev` at `4fcec3d`. The companion to
[Skill-Card-Animations-Brief.md](Skill-Card-Animations-Brief.md), which is the design brief this plan
consumes. A working plan and not a report chapter: it is meant to be turned into GitHub issues and
deleted once the work is built, the same way the handoff 15 plan was.

**The short version.** Two of the six phases need no answer from Claude Design at all and can start
today. The other four are pure CSS plus a handful of attribute writes, and every one of them is blocked
on a specific numbered decision. So the handoff round is not a stall: it runs beside Phase 0 and Phase 1.

---

## 1 What exists today

The full account is in the brief, section 0. In one table:

| Piece | State today |
| --- | --- |
| A stage for a played card | **Does not exist** |
| A moment for a card play | **Half exists.** `card-controls.js`'s `carryOn` holds the turn for `--motion-trap-hold`, but only for a fired trap, a nullified card, or a **bot's** card. A person's ordinary card play holds 0 ms |
| Motion on a played skill card | **None.** All three hand animations are scoped to `.hand--dice` |
| Where the effect landed | **Not in the state.** `lastCardPlayed` is `{ seat, cardId }` |
| How far a card's own roll reached | **Not in the state.** Hyperbeam's D4, Janky RPG's D6, Yeet's D6 and Let Him Cook's D12 are rolled inside the effect and the number is dropped |
| The card component, the geometry helpers, the timer registry, the token file | **All there and all reusable.** `card-view.js`, `board-geometry.js`'s `cellCentre` and `pawnCentre`, `timers.js`, `tokens.css` |

---

## 2 Rules the plan keeps

Existing project decisions. The plan works inside them rather than reopening them.

- **`ui/` holds no rule and never writes state.** The cast reads `state` and dispatches nothing.
- **`core/` never imports `state/` or `ui/`.** The one `core/` change in this plan, in Phase 3, adds a
  report to a patch and imports nothing new.
- **Built once, then rewritten.** The cast region is created at mount and filled by attribute writes.
  An element that is replaced restarts every transition on it, which is D10 and is the reason the
  animation would flicker if this rule were broken.
- **`rotate` and `translate`, never `transform`**, in any keyframe touching a card.
- **No file over 300 lines**, in source, tests or config. Section 3 is about this, because it is not a
  formality here.
- **No hardcoded user-facing strings.** A cast shows a card, and the card's strings already come from
  i18next. Nothing new is readable, so nothing new needs a key.
- **`?fast=1` sets every wait to zero and the shape of the turn is identical either way.** The cast
  joins `FAST_DELAYS` in `options.js` as a sixth entry.
- **Numbers live in `notes/09-source-code-overview.md` only**, next to the command that produced them.
  This plan quotes no measured figure that does not already exist in the tree.
- **Every phase carries the five mandatory steps** from `CLAUDE.md`: prompt log, documentation notes
  (`notes/04-frontend-building-blocks.md` for the view work, `notes/06-state-and-turn-flow.md` for the
  state work, `project-journal.md` for every non-obvious why), changelog, tests, Conventional Commit.

---

## 3 The 300-line problem, measured

This is the finding that shapes the phase order, and it is measured rather than assumed. Every file this
work has to touch is already at or near the limit:

| File | Lines | Headroom | Does this work touch it? |
| --- | --- | --- | --- |
| `src/ui/game-loop.js` | **300** | **0** | Yes, the cast needs a branch in `advance()` |
| `src/ui/timers.js` | **298** | **2** | Yes, a new hold helper and its fallback |
| `src/ui/card-controls.js` | **296** | **4** | Yes, `carryOn` is where a card play lands |
| `src/ui/styles/tokens.css` | **296** | **4** | Yes, the new motion tokens |
| `src/ui/overlay-view.js` | 297 | 3 | No |
| `src/ui/match-flow.js` | 295 | 5 | Only to pass `delays` through, which is one existing line |
| `src/ui/turn-waits.js` | 172 | 128 | Yes, and it is the file with room |
| `src/ui/page.js` | 105 | 195 | Yes |
| `src/ui/render.js` | 57 | 243 | Yes |

**So three splits are part of the work and not an afterthought**, and each one has a real seam:

1. **`timers.js` splits into the registry and the holds.** It is two things today: a `setTimeout`
   registry keyed by name, and five functions that answer "how long". Splitting it into `timers.js` and
   a new `holds.js` is the seam the file's own header already describes.
2. **`game-loop.js` gets shorter rather than longer.** The loop currently asks
   `if (waits.needsRollMoment(state)) { waits.showRoll(); return; }`, which is three lines for one wait.
   Two waits would be six. Replacing both with one `if (waits.takeMoment(state)) return;` is a **net
   loss of two lines** in the loop and puts the choice of which moment to take in the file that is named
   for the loop's own waits. Rejected alternative: splitting the composition root out of `game-loop.js`
   into a `loop-wiring.js`. It buys the same room and cuts a seam that is not a seam: the `wiring` object
   exists precisely so the five siblings' contract is readable in one place.
3. **`tokens.css` splits, or the cast's tokens live with the cast.** That is Claude Design's call and
   it is part of D108 and D111. The plan does not decide it.

`card-controls.js` needs no split, because the cast is entered through `turn-waits.js` and not through
`carryOn`. See Phase 1.

---

## 4 The phases

Each phase is one issue and one PR off `dev`. Sizes are rough: S is about a day for one person, M two to
three, L a week.

### Phase 0. The target in the state (S). **Not blocked on the spec**

**The problem.** `lastCardPlayed` is `{ seat, cardId }`. A Banana Peel is played on a square, a Yeet at a
pawn, a Hyperbeam along a direction, and the view is told none of it. Without the target there is no
board stage for any of the 17 cards that have one.

**The change.** `intents-cards.js` already builds `entry = { seat, cardId, target }` and then throws two
thirds of it away when it writes the record. Both call sites, the Action one and the Reaction one, become
`lastCardPlayed: { seat, cardId: intent.cardId, target: entry.target }`.

**Three things to get right.**

- **`lastCard`, the match-level record behind the HUD plate, does **not** change.** The plate shows a
  card's name and its outcome, it outlives the turn, and a target from three turns ago is a fact nobody
  is going to read. Growing both records because they look alike is how a field ends up with two
  meanings.
- **The identity comparison in `card-controls.js` must keep working.** `carryOn` compares
  `showing === held` by identity to stop one announcement being held twice, and `botCardPlayed` returns
  the frozen object off the state. Adding a field to an object that is built once per dispatch and then
  frozen and carried forward does not touch that. There is a test pinning the behaviour and it stays
  green or the change is wrong.
- **`clearedTurnFields()` needs no edit.** `lastCardPlayed` is already listed there and already dies at
  the handover. Its shape is not.

**Tests.** Extend the existing state suite: a played Action records its target, a played Reaction records
its target, a card with `TARGET.NONE` records `{}` and not `null` (the entry already uses `?? {}`), and
`game-state.test.js`'s "what survives a handover" assertion still passes unchanged.

**Docs.** `notes/06-state-and-turn-flow.md` for the fact, `project-journal.md` for why the record grew
and why its match-level sibling did not.

---

### Phase 1. The moment, and an empty stage (M). **Not blocked on the spec**

The goal is that **everything except the look** is finished and tested before the spec arrives. There is
a precedent for shipping exactly that: the card art window was a framed empty window for two sprints
while the 36 drawings only existed inside an artboard.

**1. The region.** `page.js` builds `.cast` in `matchParts` and `emptyParts` and mounts it as the last
child of `.app` before the overlay. `render.js` gains one line, which is what its header calls a
checklist rather than logic.

**2. `src/ui/cast-view.js`, new.** The whole DOM contract of the brief's section 3: `renderCast()` builds
it empty, `updateCast($cast, state, phase)` writes the attributes, and it holds the card element that
`card-view.js` builds and `skill-hand-view.js`'s `skillCard` describes, exactly as the last-card plate
does. It holds no rule and reads the state.

**3. The wait.** `turn-waits.js` gains `needsCastMoment(state)` and `showCast()`, on the pattern
`needsRollMoment` and `showRoll` already set, including the part of that pattern that cost a red suite to
learn: **the question is asked of the state, not of the phase.** A card play arrives through four doors
(a person's own play, a bot's play, a Reaction into a window, and a window closing that resolves a
pending card), and only a state-level marker catches all four.

The marker is `turnNumber` plus the number of cards played this turn, which is
`Object.values(state.cardsPlayed)` summed, the same shape as the roll's `${turnNumber}.${rollsThisTurn}`
key. Rejected: comparing the `lastCardPlayed` object by identity. It is cleared at the handover, so the
same card played on two consecutive turns compares as two different objects, which is correct, but it is
also `null` for a whole turn in which nobody plays anything and a marker that is `null` most of the time
is one `??` away from a bug.

**4. The loop.** `advance()`'s roll branch becomes `if (waits.takeMoment(state)) return;`, and
`takeMoment` asks for the cast first and the roll second. **The cast comes first because the card that
was played is usually what changed the roll**, and showing a modified number before showing the card that
modified it is the wrong order.

**5. The hold, and what it replaces.** `timers.js` splits per section 3, and `holds.js` gains
`holdCast(delays, readToken)` with a `CAST_HOLD_MS` fallback, mirroring `holdRoll`. `FAST_DELAYS` in
`options.js` gains `cast: 0`.

**One decision here is Claude Code's and it is worth stating plainly: a cast replaces the bot-card
announcement hold, and does not stack on top of it.** `midTurnAnnouncement` currently returns a bot's
card play so the turn holds two seconds for it, on the argument that a card played by nobody the player
can see has to be announced. A cast is that announcement, and a better one. So `botCardPlayed` comes out
of `midTurnAnnouncement` in this phase and the cast carries it instead. A **fired trap** keeps its own
hold, because a trap is a second event that the cast did not show. Rejected alternative: leaving both in.
It adds two seconds to every bot turn that plays a card, on top of the cast, and the bot already pauses
900 ms before it acts.

**6. Nothing is visible.** No stylesheet is added in this phase and `.cast` renders nothing. That is the
point: the moment, the wait, the attribute lifecycle and the tests are all real, and the look is a file
that drops in later.

**Tests.** `tests/unit/ui/cast-hold.test.js`, modelled on `roll-hold.test.js` and
`mid-turn-hold.test.js`: a card play takes the moment once and not twice, a zero hold resumes
synchronously rather than through the registry, a turn that ended while the hold ran is not resumed into,
and a torn-down match leaves no timer running. End-to-end `tests/e2e/cast.spec.js`: playing a card sets
`data-cast`, the sequence reaches `idle` again, and the board is left with no `data-cast-hit` attribute
anywhere.

---

### Phase 2. The base movement (M). **Blocked on D104, D105, D106, D108, D111, D112**

The first phase with something on screen.

- Land the spec's `cast.css` and `cast-base.css` and the `tokens.css` diff, unread only in the sense that
  the five landing checks from the README are run first: every decision answered, every answer with a
  reason and a rejected alternative, no CSS file over 300 lines, no user-facing string in a `content:`
  property, and every state in the DOM contract actually styled.
- **`src/ui/cast-vocabulary.js`, new**: the map from card id to `data-cast-family`, once D105 names the
  axis. `ui/` only, vocabulary and not logic, exactly like `dice-card.js`, `overlay-vocabulary.js` and
  `roll-steps.js`. If D105 picks the mechanic groups, the map is six lists; if it picks type plus
  category, it is derivable from the catalogue and the module is four lines and a test.
- **The test that stops the quiet failure**: walk the real catalogue and assert all 29 ids resolve to a
  family, on `card-art.test.js`'s precedent. A missing entry has to be a red test and not a card that
  animates as `undefined`.

---

### Phase 3. The board stage (M to L). **Blocked on D109**

The second stage, for the 17 cards that reach the board. This is the phase with a genuine unknown in it,
and it is named here rather than discovered in the middle of the work.

**3a. What the board is told.** `board-view.js` adds the empty `<span class="square__cast">` to every one
of the 40 fields at build time, on `.square__trap`'s precedent and for the same two reasons: D10 forbids
creating an element when it gets content, and both pseudo-elements of `.square` are already taken.
`board-marks.js` writes and clears `data-cast-hit`, because that file is already the one that owns marks.

**3b. The geometry.** `cast-view.js` writes `--cast-from-*` and `--cast-to-*` using
`board-geometry.js`'s `cellCentre` and `pawnCentre`, both of which exist and are already used by the drag.

**3c. The unknown, and it is a real one.** Four cards roll a die **inside their own effect** and the
number is never recorded: Hyperbeam's D4, Janky RPG's D6 aim, Yeet's D6 and Let Him Cook's D12. So the
view cannot know how far the effect reached, which is exactly what `--cast-span` is for.

Two ways out, and the plan proposes the first:

1. **Record it as a report, the way `trapFired` already is.** `trapFired` is described in `enter.js` as
   "a report and not board state", it travels in `PATCH_FIELDS`, and it exists because after the fact the
   board looks exactly as it would if nothing had happened. The four effects above are the same problem
   with the same shape. So: a `cardReach` report in the patch, written by the four effects that roll,
   `null` for the other 25. It is a small `core/` change with unit tests, and it belongs in a **Phase 3a
   of its own** so that it can be reviewed as a rules change and not smuggled in with a stylesheet.
2. **Diff the board in `ui/`.** Keep the previous state, compare pawn positions, infer the reach. It
   needs no rules change and it is rejected: it is rule reconstruction in the view layer, it gets the
   wrong answer whenever an effect moves a pawn zero squares, and `CLAUDE.md` puts rules in `core/` for
   exactly this reason.

**3d. The 12 without a board stage** do whatever D109 says they do. If the answer is "they end on the
card stage", this phase does nothing for them and that is a finished answer, not a gap.

---

### Phase 4. The 29 accents (L). **Blocked on D107 and D110**

One PR per family rather than one PR for 29 cards, so a review is readable and a family that is not
working can be held back without holding back the rest. With D105's answer unknown, the batching is not
fixable yet; the mechanic groups of § 4.3 in the brief would give six batches of 2 to 7 cards.

Two checks per batch, and both are cheap:

- **Line count.** `npm run format` then check no `cast-fx-*.css` passed 300 lines.
- **Both skins and reduced motion.** A cast that only reads in Picnic, or that ignores
  `prefers-reduced-motion`, is not finished. `greyscale.spec.js` is the precedent for testing a look
  rather than a value.

The end-to-end coverage here is **one spec that walks a fixed list of card ids** using `?stack=` to force
the hand, and asserts that each one reaches `data-cast="done"` and leaves nothing behind. Asserting what
an accent looks like is not something Playwright should be asked to do.

---

### Phase 5. The edges, and one measurement (M). **Blocked on D113, D114, D115**

The four cases that are each somebody's bug report if they are skipped:

1. **A cancelled card** (`data-outcome` `nullified` or `negated`), including the Nühü case where two
   casts want the screen inside one moment and the second one exists to say the first did nothing.
2. **A Reaction played into an open window**, with the 30-second clock and the prompt strip already up.
3. **A bot's cast**, which is `data-actor="bot"` and which Phase 1 already made the announcement for.
4. **Reduced motion end to end**: a Playwright run with `prefers-reduced-motion: reduce` that plays a
   card and asserts the turn still advances and still takes its hold.

And the measurement the brief's § 4.4 says is missing: **how many skill cards a match actually plays.**
The bot arena from the Bot Tactics Plan produces it, the figure goes into
`notes/09-source-code-overview.md` next to the command that produced it, and only then can anybody say
what this feature costs a match in seconds. Until then the honest sentence is the one in the brief: the
hold is paid once per card play and nobody has counted the card plays.

---

## 5 Order and dependencies

```
Phase 0  target in the state        ─┐
                                     ├─▶ Phase 1  the moment + empty stage ─┐
(design handoff round runs here) ────┘                                      │
                                                                            ▼
                                     Phase 2  base movement  ──▶  Phase 4  the 29 accents
                                            │                              ▲
                                            └──▶ Phase 3  board stage ─────┘
                                                       │
                                                       └──▶ Phase 5  edges + measurement
```

- **Phases 0 and 1 need nothing from Claude Design** and should start immediately, in parallel with
  writing the brief into the handoff folder. That is the whole reason the brief's section 3 fixes a DOM
  contract before a single look is decided.
- **Phase 3a** (the `cardReach` report) can also start early, since it is a rules change that D109 will
  need whatever D109 answers.
- Phase 4 is the long one and it is the one that can be **cut short**: with Phase 2 landed, every card
  already has its family's base movement, and a match with 12 accents built and 17 outstanding is a
  playable game that looks finished to anybody who is not counting.

---

## 6 Risks

| Risk | Why it is real | What the plan does |
| --- | --- | --- |
| **The turn gets slower and the game gets worse** | A cast is paid once per card play, on top of the bot's 900 ms and the roll's 900 ms. Nobody has measured the card plays per match | Phase 1 takes the bot announcement's two seconds **away** rather than adding to them. Phase 5 measures. D111 is where the number is decided, and it is decided with a reason |
| **The board stage stalls on the missing reach** | Four cards roll inside their effect and drop the number | Phase 3a, named as a separate rules change, before the CSS work depends on it |
| **Two casts inside one moment** | Nühü answers a card with a card | D113, and Phase 5 is the phase that builds the answer rather than discovering it |
| **The 300-line limit turns into a rushed split** | Four of the files this touches have 0 to 4 lines of headroom | Section 3 names each split and its seam **before** the phase that needs it |
| **The spec asks for a hook the DOM does not have** | It happened before, and the workaround is CSS that depends on DOM order | The brief says in as many words: ask, do not work around it. Claude Code adds the hook |
| **29 accents is a lot of taste and not much engineering** | A batch could drift from D14's flat, hard-shadowed, gradient-free look | One PR per family, both skins checked per batch, and the base movement from Phase 2 is what holds them together |

---

## 7 Open questions for the Product Owner

Not design questions and not code questions. These are calls about the game.

1. **How long may a card play take?** The roll costs about 0.9 s per turn. A cast of similar weight,
   paid roughly as often, is a comparable bill. Is that worth it, or should a cast be shorter than a
   roll because it happens as often but decides less?
2. **Should a cast be skippable?** A click during the hold could end it early. `carryOn` already treats a
   deliberate click as the player saying they have read something, so the precedent exists.
3. **Is the reduced-motion setting enough**, or does the game want its own "fewer animations" option in
   the settings that S11 has not built yet?
4. **Phase 4 is the cuttable half.** If the schedule runs out, is a game where every card animates by
   family and 12 of 29 have their own accent acceptable, or is it all or nothing?

---

## 8 Proposed issues, in English, ready for the board

Everything on GitHub is in English. Phase labels are `4-implementation` unless noted.

| # | Title | Body, in short | MoSCoW | Size |
| --- | --- | --- | --- | --- |
| 1 | `Record a played card's target in the state` | `lastCardPlayed` grows a `target` field so the view can know which square or pawn a card acted on. `lastCard` is unchanged. Phase 0 | should have | S |
| 2 | `Give a played skill card a moment of its own` | A cast region, its lifecycle, a new hold, and the split of `timers.js` into the registry and the holds. Nothing visible yet. Phase 1 | should have | M |
| 3 | `Design handoff 18: an animation per skill card` | Write brief 18 into `01-Design/Handoff/`, run the round, land the spec and check it against the five landing checks. Phase `3-planning` | should have | S |
| 4 | `Report how far a card's own roll reached` | Hyperbeam, Janky RPG, Yeet and Let Him Cook report their roll, the way a fired trap is reported. Phase 3a | should have | S |
| 5 | `The base movement, per card family` | Land `cast.css` and `cast-base.css`, add `cast-vocabulary.js` and the test that all 29 ids resolve. Phase 2 | should have | M |
| 6 | `The board half of a cast` | `.square__cast`, `data-cast-hit`, the geometry properties, the 17 cards that reach the board. Phase 3 | could have | M |
| 7 | `An accent per card: <family>` | One issue per family, from D107's table. Phase 4 | could have | M each |
| 8 | `Cast edge cases: cancelled cards, reactions, bots, reduced motion` | The four cases of Phase 5, plus the card-plays-per-match figure into `notes/09` | could have | M |

Issue 3 is the one to open first even though it is the smallest, because issues 5 to 8 are all waiting on
what it produces.
