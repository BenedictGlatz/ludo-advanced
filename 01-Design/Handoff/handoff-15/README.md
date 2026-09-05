# Handoff 15, delivery

**From:** Claude Design
**Date:** 2026-09-05
**Read against:** `2d01e73`, on branch `feature/82-bot-card-tactics`, with one qualification in § 3

The line-up screen. D90 to D96, answered in `01-Design/Handoff/15-spec-bot-setup-menu.md`. **D86 of
brief 13 is retired with them**, as the brief itself asks.

---

## What goes into the repository

**Two files, and one of them is the spec.**

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/lineup.css` | **New file.** The whole of the line-up's own layout | 223 |
| `01-Design/Handoff/15-spec-bot-setup-menu.md` | New | n/a |

**`overlay.css` is not amended and `tokens.css` gains no token, so there is no diff to read.** § 7 of
the brief asks for a diff rather than a whole file if either changes, and neither does.
`tokens.css` staying at 298 of 300 is the point rather than luck: the two numbers this screen owns, the
panel's 44rem and the control pair's 14rem, are measurements of one screen, so they live in that
screen's file, which is what D75.3 settled for `menu.css`.

**`lineup.css` has to be added to the load order, after `overlay.css`.** It is independent of
`handover.css` and of `menu.css`; no two of the three ever match the same element.

---

## What this needs from Claude Code

All of it is in § 6 of the spec. The summary, in the order it would be built:

1. **`OVERLAY_SCREEN.LINEUP = "lineup"`**, the seventh value. The word is kept as § 5 of the brief
   offers it.
2. **One line in `session-actions.js`, line 53.** The count click opens the line-up with that count
   instead of calling `freshMatch(count)`. The half made line-up is view state beside `screen` in
   `match-flow.js` and nothing about it reaches `core/`.
3. **The rows.** One `.overlay__seats` group, one `.overlay__seat[data-player][data-controller]` per
   seat the count actually uses, each holding `.overlay__seat-name` and `.overlay__seat-choice` with
   two `.overlay__button[data-action="controller"][data-seat][data-value]` elements carrying
   `aria-pressed`. `data-controller` is `hud-view.js`'s word, reused unchanged (constraint 8).
4. **`disabled` on the `bot` position of the last remaining person**, recomputed on every switch. No
   click filter, which is the point of D93.1.
5. **Back then Start in `.overlay__actions`**, Start with `data-variant="primary"`.
6. **One focus exception, `overlay-view.js` lines 213 to 215**: prefer `[data-action="begin"]`, else
   the first `.overlay__button` as today. This is the one change to an existing function and D94.3 asks
   for it on purpose, with its cost attached.
7. **Six locale keys in both `de/ui.json` and `en/ui.json` in the same commit**, per
   `tests/unit/i18n/locales.test.js`. The table in § D96 of the spec is the list. `player.named` and
   `player.botNamed` are reused as they are, so the row labels are not new strings.
8. **`lineup.css` in the load order** in `main.js`, after `overlay.css`.

**Two things worth reading before the build.**

**The line-up is a set of seats, not a count of bots.** `botSeatsFor` in `state/bots.js` computes bot
seats from a count and a number, and it stays exactly as it is for `?bots=`. This screen produces the
set directly, because D95 lets seat 0 be a bot, so `freshMatch` needs a way to be given the set.
`options.js` lines 105 to 110 keep refusing `bots >= players` and stay as the second guard behind D93.

**A rebuild has to restore the line-up from the flow, not from the DOM.** `overlay-view.js` lines 197
to 201 rebuild the buttons on every screen change and on every language switch, so `aria-pressed`,
`data-controller` and the `disabled` position all have to be written back from the flow's line-up.
Switching language halfway through setting the seats is the case that finds it.

---

## § 3 On the commit, and it is a finding rather than a formality

Constraint 9 asks for the commit. The honest version of the answer is the same one handoff 12 gave.

**The stylesheet copies available to this side still predate the tree the brief measures.**
`overlay.css` is 229 lines here against the 234 the brief quotes, and `tokens.css` has no `--stage-w`.
Two consequences, both already handled rather than reported:

1. **Nothing here could revert anything.** The only file delivered is new, and the two files this
   delivery would otherwise have opened, `overlay.css` and `tokens.css`, are the two it does not touch.
2. **`lineup.css` was written against the local `overlay.css`**, and every line number in the spec is
   from that copy **with the selector named alongside it**. If a rule moved between the two trees, the
   selector is what to trust.

The mockup pins the fitted stage itself rather than reading it from `app.css`, for the same reason: the
root is set to 14.4 px, which is what `min(100vw / 100, 100vh / 56.25)` evaluates to at 1440 by 900, so
every measurement in § 3 of the brief applies as written.

---

## The mockup

`mockup/` runs standalone. Open **`Line-up.dc.html`**. It is one canvas with five artboards on it and
the switches are `view`, `theme`, `greyscale` and `focusDemo`.

What is worth looking at, in order:

1. **S2, unchanged.** Drawn first because § 3 of the brief says the pair is what is being designed. The
   line-up arrives directly after it, and the two are the only pair of screens in this game seen back
   to back. S2 keeps its title, its three counts and its 34rem panel; D96.1 declines the offer to
   reword it.
2. **15a, four seats as the screen opens.** Every row a person (D92), nothing locked, and the words in
   German because German is the default and the longer of the two. This is what a player who clicks
   straight through gets, and it is today's match.
3. **The row itself.** Plate, name, pair. The chosen position keeps the face and the hard shadow, the
   other lies flat with its ink edge and its label both at full strength, because it is a live choice
   one click away and not a dead door. That is the difference from `menu.css`, and it is one
   declaration.
4. **15b, four seats with one person.** The FR-01 lock: the last person's **Bot** position is
   `disabled`, in `--color-dormant` with no face, no shadow, no tab stop and no hover. The sentence
   above the rows is what lets it be disabled rather than argumentative, and it is on screen at all
   times. Note what is **not** dimmed: the bot rows keep their wash and their plate, because those
   seats are played.
5. **15c, two seats.** The case a four row drawing hides. Seats **0 and 2**, so red and green with no
   yellow, and the rows read "Bot 1 (Rot)" and "Spieler 3 (Grün)" with no 2 in sight. It also draws
   D95: the bot has seat 0, so the computer moves first and the player sits opposite in green.
6. **`focusDemo: true`.** The keyboard ring on **Spiel starten**, painted without a keyboard. That is
   D94.3, the one change this delivery asks for in an existing function.
7. **`greyscale: true`.** Two cues carry the state of a row with the colour gone: the raised position
   and the word in the name. The `--player-soft` wash says which seat, never who plays it.
8. **The fifth artboard, 430 by 820**, below the 84rem breakpoint where the fitted stage is off. The
   pair cannot sit beside the name, so it drops under it and spans the row as two half width targets,
   both still 44 px tall. The plate and the name keep their line. That is the whole of the media block.
   It is a live frame, so it scrolls if it needs to, and at four seats it does not.

**Two things in the mockup are mockup only.** `mockup/src/ui/styles/mockup.css` says so in its own
header: the canvas furniture and the focus hook. It also carries the one place the mockup guesses, the
language button pushed to the right end of the chrome row, for the reason in § 7 of the spec.
`mockup/src/ui/styles/` holds only the stylesheets this screen needs to run, not a snapshot of all
twenty.

The mockup is not production code. The six sentences on it stand in for i18next keys.

Delete this folder after the review, the same as `handoff-04/`, `handoff-05/`, `handoff-07/`,
`handoff-10/`, `handoff-11/` and `handoff-12/`.

---

## The landing checks

1. **D90 to D96 answered**, none skipped, each with at least one named rejected alternative. Nineteen
   across the seven, five on D91 and four on D93.
2. **No CSS file over 300 lines after `npm run format`.** 223 unformatted, landing near 230.
   `tokens.css` stays at 298 of 300, which constraint 6 makes the only acceptable answer.
3. **No user-facing string in a `content:` property.** One `content: ""`, on the seat plate, which is a
   shape and not a word.
4. **Built once, then only attributes rewritten.** Nothing in this file animates a control's arrival.
   See the note on the rebuild above, which is the other half of this check.
5. **Two skins and `prefers-reduced-motion`.** Every value is a token; the file declares no transition
   and no animation.
6. **`npx playwright test tests/e2e/match-flow.spec.js`.** It owns this flow. Every `[data-count]`
   click now needs a Start after it, which § 10 of the brief books as Claude Code's work.
7. **`npx playwright test tests/e2e/handover.spec.js tests/e2e/dice-pool.spec.js`.** Three more count
   clicks, same one step addition. `?players=` and `?bots=` are untouched, so the sixteen specs that
   boot into a match are unaffected.
8. **A new spec for this screen.** The brief names three cases and § 8 of the spec adds four, including
   the two seat case with no seat 1 and the keyboard landing on Start.
9. **1440 by 900, and one check below the 84rem breakpoint.** Both on the canvas, the second at 430 by
   820.

**No em dash, in the spec, in `lineup.css` or in this file.** Rule 5 of the work order, checked.
