# Handoff 06, brief: the seat mark on the pawn

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-02
**Issue:** none. NFR-12 has no board issue. The nearest epic is #3 (Create Design System), closed 2026-08-30.
**Answers:** D16 of handoff 02, left open by spec 04 § 5 as "a follow-up of about fifteen lines"

---

## 0 Why this brief exists, and why it is first

**This is the only open design item in the project that blocks a requirement.** NFR-12 reads: *Players
are distinguishable without relying on colour alone: shape, pattern or label as well. Acceptance: a
greyscale screenshot still identifies each player's pawns.* It is `should have`.

Spec 04 answered D16 with a clip-path shape per seat, a circle, a triangle, a square and a diamond, and put
it on the HUD seat plate, the chrome turn sentence, the win panel and the handover panel. It then said,
correctly, that NFR-12 is measured **on the pawn**, that the mark is not there, and that closing it needs
one element the DOM contract did not promise plus about fifteen lines of `pawn.css`.

**The element now exists.** As of the commit that ships this brief, every `.pawn` contains an empty
`<span class="pawn__mark">`, and `tests/e2e/board-renders.spec.js` asserts it is there. What is left is
yours: the fifteen lines.

**Why 06 before 05.** Handoff 05 (the dice pool overview) is also open and is larger. This one is asked
first because it closes a requirement and 05 closes a preference, and because it is small enough to be
answered in one sitting. If both can be delivered together, deliver both; if only one, this one.

**The clock.** Sprint 3's feature freeze is 2026-09-11. Everything that lands after it is documentation.

---

## 1 What to design

| Id | Screen | What is wanted |
| --- | --- | --- |
| **S3** | Board | The seat's shape on each pawn, so that the four seats are distinguishable with the colour removed |

Nothing else. The HUD, chrome, win and handover marks are delivered and are not reopened here.

---

## 2 Hard constraints, each with the reason it exists

The first six are the standing ones from handoffs 03 to 05, repeated so the spec can be checked without
leaving this file. The last three are specific to the pawn.

1. **jQuery writes attributes, never styles.** The mark is keyed off `data-player` on the pawn, which
   already exists. `src/ui/` carries no colour and no size (NFR-01, `CLAUDE.md`).
2. **No CSS file over 300 lines, measured after `npm run format`** (NFR-02). `pawn.css` is 166 lines
   today. If the answer needs more than about 80 unformatted lines, split at a real seam and say which.
3. **No user-facing string in CSS.** Nothing a player reads in a `content:` property (NFR-03). A letter
   or a number as the mark would break this and is why spec 04 chose a shape. Stay with the shape.
4. **Built once, then only attributes rewritten** (D10 of spec 01). The pawn is never re-created between
   two positions, so the mark travels with it for free. Do not require the view to touch the span.
5. **Two skins from the tokens**, through `light-dark()` pairs where a new value is needed.
6. **`prefers-reduced-motion` is respected.** If the mark takes part in any loop, it stops under it.
7. **The two pseudo-elements of `.pawn` are taken.** `::after` is the body, the disc with the ink outline
   and the two eyes of D14. `::before` is the state ring that `data-movable`, `data-selected`,
   `data-captured` and `:focus-visible` change. That is the reason the mark is a real element and not a
   third layer: there was no third layer to give it.
8. **The five pawn states keep working with a child present.** The mark must not cover the ring, the
   focus outline, or the capture dim in a way that hides them. `data-selected` scales the pawn to 1.14 and
   `data-captured` to 0.82 at 70 % opacity, so the mark is seen at both sizes.
9. **No em dash, anywhere, in the spec or in a CSS comment.** `CLAUDE.md` bans the character and the
   rhetorical habit it enables. Use a colon, a semicolon, a comma or two sentences. In a table cell where
   a value is absent, write `n/a` or `none`.

---

## 3 The DOM contract

Claude Code guarantees these elements and attributes exist. The CSS may target them and nothing else.

```html
<div class="board" data-players="4" data-active-player="0" data-die="6">

  <!-- one per pawn, a direct child of .board, positioned by --pawn-col and --pawn-row set inline -->
  <div class="pawn" data-player="0" data-pawn="0" data-r="0" tabindex="0"
       style="--pawn-col: 2.5; --pawn-row: 2.5">
    <span class="pawn__mark"></span>
  </div>

</div>
```

| Selector | Meaning | Who sets it |
| --- | --- | --- |
| `.pawn[data-player="0..3"]` | The seat. `board.css` lines 45 to 57 turn it into `--player`, the seat colour | view, once |
| `.pawn[data-r]` | Position on the 44-step journey, 0 is the yard | view, every move |
| `.pawn[data-movable="true"]` | Has a legal move this turn | view |
| `.pawn[data-selected="true"]` | The player picked it | view |
| `.pawn[data-captured="true"]` | Transient, on the way back to the yard | view, cleared after the animation |
| `.pawn:focus-visible` | Keyboard focus, D11 | browser |
| `.pawn > .pawn__mark` | **New.** Empty span, no attributes, no text. Present on every pawn from the moment it is built | view, once |

There is no `data-` attribute on the span and none is planned. If the answer needs one, name it in § 5 of
the spec and Claude Code adds it, the way spec 04 named three.

**Tokens that already exist and the mark is expected to use**, from `tokens.css`:

| Token | Value today | Where it is used |
| --- | --- | --- |
| `--seat-shape-0` to `--seat-shape-3` | circle, triangle, square, diamond as `clip-path` values | `hud.css` 38 to 53, `chrome.css` 46 to 58, the overlay panels |
| `--seat-mark` | `0.85rem` | The mark's size on a HUD plate. **Not** a pawn size; the pawn scales with the board and a rem does not |
| `--pawn-size` | `calc(var(--cell) * 0.78)` | The piece |
| `--cell` | `calc(var(--board-size) / 11)` | One grid cell |
| `--pawn-scale` | `1`, set to 1.14 and 0.82 by two states | The piece's transform |
| `--color-ink`, `--border-ink`, `--border-hair` | the outline colour and widths the piece and the HUD mark already use | `pawn.css`, `hud.css` |

The HUD applies the shape as `background: var(--seat-color); clip-path: var(--seat-shape)` with a hairline
ink outline. Whether the pawn does the same is D48.

---

## 4 Facts the design must match

### 4.1 The measurement, and why colour alone did not pass

`tests/e2e/greyscale.spec.js` reduces the four seat colours to relative luminance and compares every pair
as a contrast ratio. **Measured 2026-08-30: the worst pair is red against blue at 1.146**, greys 147 and
137 out of 255, ten levels apart. Red against green is second worst at 1.263. The test's own derivation
says the best an evenly spread four-value palette over this luminance range could reach is about 1.31, so
falling short is a fact about the hues and not about the threshold. The test is marked expected-to-fail
for that reason and has been since 2026-08-30.

Spec 01 D2 named the two ways out: re-spread the palette, or reinstate a non-colour identifier. Spec 04
took the second for the page furniture. This brief takes it to the piece.

### 4.2 What the piece looks like today

- A disc of `--pawn-size` in the seat colour with a `--border-ink` outline, a hard offset shadow and two
  eyes painted as four radial gradients in the upper half (D14, "a little creature, not a counter").
- Up to 16 pieces at once, 4 per seat. In a two-player match, seats 0 and 2 only.
- Pieces in the yard sit in four slots close together; pieces on the track can share a field with an
  opponent only for the instant before a capture resolves.

### 4.3 How the test will change once the mark lands

So that the spec is written against the thing that will be asserted. The first test in `greyscale.spec.js`
comes off expected-to-fail and asserts the acceptance criterion as written:

1. every pawn's `.pawn__mark` has a non-zero rendered box;
2. the computed `clip-path` of the mark is the same for the four pawns of one seat and different across
   seats;
3. both of the above hold with `html { filter: grayscale(1) }` applied, and the greyscale screenshot the
   suite already attaches shows it.

If D50 keeps the luminance measurement, it stays as a plain test with the threshold the spec names.

---

## 5 Open decisions this handoff must answer

Each with its reason and at least one rejected alternative, as always.

**D48. Size and placement of the mark on the piece, and its relationship to the eyes.** The HUD mark is a
fixed rem; the piece scales with the board. Does the mark sit below the eyes, replace them, or become
the piece's silhouette itself (a triangular pawn rather than a disc with a triangle on it)? D14 chose the
creature on purpose, so if the answer changes the creature, say why it is worth it.

**D49. The mark through the five states.** At `data-selected` (scale 1.14) and `data-captured` (scale 0.82,
70 % opacity) is the mark still read? Does it take part in the `pawn-breathe` loop of `data-movable`, and
what does it do under `prefers-reduced-motion`? Does the focus ring of D11 still clear it?

**D50. What happens to the luminance measurement.** Once the shape is on the piece the requirement is met
by shape. Options: retire the 1.30 luminance test and record the 1.146 figure in the notes as history;
keep it as a second, weaker check with a threshold you name; or re-spread the palette as well, which spec
01 D2 called the other way out. Pick one and say what it costs. This is half a test question, and it is
asked here because the answer depends on whether the palette will ever move.

### 5.1 Still open from earlier handoffs, not reopened here

D17, D21, D22, D23, D24 from handoff 02, and D43 to D47 from handoff 05. Answer any of them in this spec
only if the pawn work happens to settle it, and say which.

---

## 6 Deliverables

| File | Contains |
| --- | --- |
| `01-Design/Handoff/06-spec-pawn-mark.md` | The five-section spec: files delivered, D48 to D50 answered with reasons and rejected alternatives, tokens added if any, states covered against § 3, what is still open |
| `src/ui/styles/pawn.css` | Amended. The mark and its behaviour in the five states. Under 300 lines after `npm run format` |
| `src/ui/styles/tokens.css` | Only if a new token is needed. Additive: nothing removed or renamed without saying so in the spec |
| `01-Design/Handoff/handoff-06/` | Optional. A mockup shell if you need one to look at it, in its own folder with a `README.md` saying it is not production code. It is deleted after the review, the same as `handoff-04/` |

If a file arrives that this brief did not ask for and you did not change, say which commit or date the
snapshot was taken from. Handoff 04 delivered a `board.css` that predated an NFR-02 split, and copying it
would have reverted the split silently.

---

## 7 Out of scope, said explicitly

- **Handoff 05**, the dice pool overview. Its brief stands on its own.
- **The HUD, chrome, win and handover marks.** Delivered by spec 04, not reopened.
- **Audio and every sound cue.** Issue #40, deferred out of epic #39 on 2026-09-01 and under a separate
  decision this week.
- **The palette itself**, unless D50 chooses to re-spread it, in which case say so and list the changed
  tokens.
- **Anything a pawn does that is a rule.** Where it moves, when it is captured, what it can land on.

---

## 8 The landing checks

Claude Code does not merge a spec unread. Same list every time, plus one:

1. D48, D49 and D50 answered, none silently skipped.
2. Every answer carries a reason and a named rejected alternative.
3. `pawn.css` under 300 lines after `npm run format`.
4. No user-facing string in a `content:` property.
5. Every state in § 3 still styled with the mark present.
6. **`npx playwright test tests/e2e/greyscale.spec.js` passes in Chromium, Firefox and Edge with no
   expected-failure marker**, after the test is rewritten as § 4.3 describes.
