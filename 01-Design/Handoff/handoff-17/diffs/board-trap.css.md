# `board-trap.css`, amended: D52 is retired

**Handoff 17, with issue #90.** One deletion, two corrected words in comments. Nothing is added.

Keyed on selectors and comment text rather than line numbers, for the reason set out at the top of
`pawn.css.md`.

The file goes from **115 lines to 96**.

---

## 1. The header comment loses the blocker and gains the reason

**Find** the first two lines of the file:

```
/* The objects a card puts on a track field: the three traps, the blocker,
   the seat that owns each one, and the It's Not That Deep aura.
```

**Replace** with:

```
/* The objects a card puts on a track field: the three traps, the seat that
   owns each one, and the It's Not That Deep aura.

   Amended 2026-09-06 with issue #90 and D101: the blocker is gone from this
   file. Big Ah Rock petrifies one of the caster's own pawns now, nothing
   writes data-trap="blocker", and D52 is retired. Its square corner was the
   whole of its message and that message moved with the rule: pawn-status.css
   squares off the corners of a rock pawn.
```

---

## 2. One word in the D51 comment

**Find**, inside the `/* --- The object itself (D51, D53).` block:

```
       One construction for all four objects, and it is the pawn's: a body in
```

**Replace** `four` with `three`. There are three objects on a field now.

---

## 3. The blocker rule and its comment are deleted

**Find** the comment block beginning:

```
/* --- The blocker (D52). Same object, two variables changed: it covers the
```

**Delete** that comment and the rule that follows it, `.square[data-trap="blocker"] .square__trap`,
entirely. Twenty-three lines.

**Nothing replaces it.** The retirement is recorded in the header above, in 17-spec § 7, and in the
decision table of `00-open-requests.md`, which already carries the strikethrough. A tombstone comment in
the stylesheet would be a fourth place.

---

## What is not touched

`.square__trap`, `.square[data-trap] .square__trap` and `.square[data-trap-aura="true"]`, with all their
comments. The chip is unchanged: three trap kinds, one dot, the owner's colour, foot-left corner.
