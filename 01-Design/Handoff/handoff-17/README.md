# Handoff 17, delivery

**From:** Claude Design
**Date:** 2026-09-06
**Answers:** brief 17, D100 to D103, and retires D52 with issue #90.
**Read against:** the local stylesheet copies handoffs 12, 15 and 16 reported on, plus the four DOM
facts brief 17 § 2 promises from `dev` and the branches of issue #87. Nothing in this package is a
whole existing file, so the stale-copy problem of handoffs 10, 11 and 16 cannot happen this time.

Three things a playtester could not see:

1. **A protected pawn looked like every other pawn.** Nine statuses, two of them drawn. All nine are
   drawn now, in three channels, and `armoured` and `ghost` share one mark because they say one thing.
2. **Nobody could tell what the last card played was.** A fifth plate at the end of the HUD row, with
   the card itself one hover away at the size its paragraph was written for.
3. **A pawn can be dragged and the carried pawn was unstyled.** It grows, it throws the longest shadow
   in the game, it drops every transition, and the field under the pointer answers.

**D102 comes back no.** The native `title` from issue #94 stays and nothing replaces it. The reason is
in the spec and it is short: the tester was clicking, not hovering.

---

## What goes into the repository

**Six files, and one of them is the spec. Three are new and two are change lists.**

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/last-card.css` | **New.** D100 | 234 |
| `src/ui/styles/pawn-status.css` | **New.** D101, with D56 and D57 moved into it | 225 |
| `src/ui/styles/pawn-drag.css` | **New.** D103 | 86 |
| `diffs/pawn.css.md` | Amendment, rule by rule. Two deletions, one comment | 253 to 192 |
| `diffs/board-trap.css.md` | Amendment, rule by rule. The D52 blocker rule goes | 115 to 96 |
| `01-Design/Handoff/17-spec-last-card-and-pawn-status.md` | New | n/a |

**No `tokens.css`, no `app.css`, no `hud.css`, no `board.css`, no `refusal.css`, no `card.css`.** No new
token, no new duration, no new locale mechanism, nothing in `core/`.

**Load order**, three additions and no reordering:

```
… board-trap.css, pawn.css, pawn-status.css, pawn-drag.css, …
… hud.css, …, card.css, card-state.css, card-reveal.css, last-card.css
```

### The two amendments are change lists, and here is why they are not unified diffs

You asked for a diff after handoffs 11, 13, 14 and 16, and the request is right. A unified diff's line
numbers would still be wrong on arrival: brief 17 § 2.1 says your `pawn.css` is 252 lines with issue
#91's drag rule in it, and the copy this was written against is 253 lines without it. So the two files
in `diffs/` name the **comment block or selector to find**, quote the exact text to delete and the exact
text to insert, and add nothing anywhere else. That is the form handoff 16 was actually landed in, and
your own words for it are "the selector named beside each rule is what to trust, not the line number".

Both amendments are deletions. Nothing in either file is being replaced with a newer opinion.

---

## What this needs from Claude Code

§ 5 of the spec has it in full, with the markup. In the order it would be done:

1. **Build the `.last-card` section once, as the last child of `.hud`.** Four class names, four data
   attributes and a `tabindex`. It must be inside the HUD's flex row, not a sibling in the app grid: the
   HUD row spans both columns and the plates centre, so a plate outside that row cannot sit at its end.
2. **Use `data-player`, not `data-seat`.** Same value. `board.css` maps `--player` off `[data-player]`
   for the whole document, and since D97 that is the only place a seat colour is written.
3. **Write `data-drop="true"` on the field under the pointer during a drag**, and clear it on leave and
   on release. One attribute, one field at a time. It is the only hook in this handoff that issue #91
   did not already ship.
4. **Add six `lastCard.*` keys.** English wordings are in spec § 5; the German is yours.
5. **Take issue #91's drag rule out of `pawn.css`** if it is there. `pawn-drag.css` owns `translate` on
   the pawn now, and it also restates the pawn's transition with `translate` added, which is what makes
   the release continuous instead of a snap back to the square the piece left.
6. **Delete, do not rewrite, any test that asserts the blocker chip.** The 76 per cent chip and its
   square corners are gone with D52. The corner reappears on the rock pawn, but that is a different
   element with a different value, and a case that follows a mark from one to the other is asserting the
   spec's prose rather than the game.

### The new DOM, verbatim

```html
<!-- last child of .hud, built once -->
<section class="last-card" data-player="2" data-outcome="resolved" data-empty="false" tabindex="0">
  <h2 class="last-card__heading">…</h2>   <!-- t("lastCard.heading") -->
  <p class="last-card__line">…</p>        <!-- the card's own name, from the card data -->
  <p class="last-card__by">…</p>          <!-- t("lastCard.<outcome>", { player, turn }) -->
  <div class="last-card__reveal">
    <div class="card card--full" data-card-id="reaction-nuehue" …>…</div>  <!-- card-view.js, as is -->
  </div>
</section>
```

`data-outcome` takes the four values `state.lastCard.outcome` already has. `data-empty="true"` before the
first card of the match, with `lastCard.empty` in `.last-card__by` and `.last-card__line` empty. The
plate is in the row from the first frame, because a plate that appears on turn three moves the other four
sideways once, mid-game, for no reason the player can see.

The pawn needs **nothing new**. `data-statuses`, `.pawn__status`, `title`, `data-dragging`, `--drag-dx`
and `--drag-dy` are the whole contract and all of them exist.

---

## The thing to read before signing this off

**§ 0 of the spec.** All four answers land on one rule: draw the fact that changes what somebody does
next, and put the fact that changes only a rule into words. It is why `armoured` and `ghost` get one mark
rather than two, why `nullified` and `negated` read identically in the plate, and why D102 is a no.

If that rule is wrong, three of the four answers change together, which is the cheapest possible time to
say so.

**One measurement is worth checking before the plate is built.** The rail was the obvious home for D100
and it has no room: on the fitted stage at 1440 by 900 the three rail plates stand about 723 px in a
column about 738 px tall. A fourth plate there is paid for out of the dice hand's `--card-u` and nothing
else. If that number is wrong on your side, the answer to "where does it go" changes and the stylesheet
is mostly reusable: the plate is `.hud__seat`'s chrome at `.hud__seat`'s width.

---

## The mockup

One new review canvas at the project root, linking `src/ui/styles/` directly, so it shows the change as
delivered:

- **`Last Card and Pawn Status.dc.html`.** The HUD row with the plate at its end and the four outcomes
  on a switch; twelve status combinations on all four seats, including `locked armoured` and
  `rock slippery`; the shell inside the movable, selected and rock states; and the carried pawn beside a
  plain field, a legal target and the field under the pointer. Skin and greyscale switches on both.

`Traps and Statuses.dc.html` still renders the trap chip and the slippery tag and is unaffected, except
that its square 23 blocker no longer draws: `data-trap="blocker"` has no rule any more, which is the
change being reviewed.

Delete `handoff-17/` after the review, the same as the earlier packages.

---

## The landing checks

1. **`grep -r "data-trap=\"blocker\"" src/ tests/` returns nothing**, and `grep -r "blocker" src/ui/styles/`
   returns nothing.
2. **No CSS file over 300 lines after `npm run format`.** The longest file in this package is
   `last-card.css` at 234. `pawn.css` drops from 253 to 192, which is the room D103 needed.
3. **Two skins.** The shell on the yellow seat in Picnic and on the red seat in Night In are the two to
   look at: an ink ring standing off a light fill and off a dark one.
4. **Greyscale.** Every mark in D101 is ink geometry and all twelve combinations survive. The seat colour
   under them still does not, which is D99 and not this handoff.
5. **A `locked armoured` pawn shows two marks.** That is the playtest finding, in one assertion.
6. **The reveal over a full dice hand.** Point at the plate with three unresolved dice cards below it.
   The card must be above them, and it must never take their click: it is `pointer-events: none` at
   `--layer-card-reading`.
7. **A drag over a field that is a legal target, a skill square and trapped at once.** Four marks on one
   field and none of them gives way, which is D54's rule holding with a fifth object added.

**No em dash, in the spec, in the three stylesheets, in the two change lists or in this file.** Rule 5 of
the work order, checked.
