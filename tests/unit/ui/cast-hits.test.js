/**
 * What a played card's effect marks on the board. Design spec 18, D109.
 *
 * `cast-hits.js` is pure and takes plain objects, so it is a unit test in the same way the card
 * effects are: a state in, a list of marks out, no DOM anywhere.
 *
 * ## What it is at risk of, which is not a crash
 *
 * Every wrong answer here is a wrong picture and nothing else. A `victim` where an `actor` belongs
 * paints the caster's own piece in the refusal orange; a run drawn in the wrong direction lights the
 * squares the pawn is about to walk instead of the ones it just crossed. None of it throws and none of
 * it makes a test go red anywhere else, which is exactly why the cases are here.
 */

import { describe, expect, it } from "vitest";

import { squareOf } from "../../../src/core/displacement.js";
import { NULLIFY_RADIUS } from "../../../src/core/trap-rules.js";
import { auraHits, castHits } from "../../../src/ui/cast-hits.js";

/** A pawn list with one pawn of seat 0 and one of seat 1, at the given `r` values. */
function board(entries) {
  return {
    pawns: entries.map(([player, pawn, r]) => ({ player, pawn, r })),
    pendingMove: null,
  };
}

/** A played-card record, the shape `lastCardPlayed` has. */
const play = (cardId, target = {}) => ({ seat: 0, cardId, target });

/**
 * The absolute track square a pawn stands on, asked the way the game asks it.
 *
 * The cases below name a pawn by its `r`, which is a **seat-relative** step count: seat 1's `r = 12`
 * is not square 12. Working the expected run out here rather than writing the numbers in means a case
 * says "three squares in front of this pawn" and not "square 23", which is what it is actually about.
 */
const square = (player, r) => squareOf({ player, r });

/** Just the squares of one kind of mark, in the order they were produced. */
const of = (hits, kind) => hits.squares.filter((mark) => mark.hit === kind).map((m) => m.square);

describe("the three cards that lay something on a field", () => {
  it("marks the field a Banana Peel was laid on, and nothing else", () => {
    const hits = castHits("trap", play("action-banana-peel", { square: 7 }), board([]));

    expect(hits.squares).toEqual([{ square: 7, hit: "direct" }]);
    expect(hits.point).toEqual({ square: 7 });
  });

  /** An Oil Spill spreads: the field it was laid on, and the two it runs into. */
  it("spreads an Oil Spill onto both neighbours", () => {
    const hits = castHits("trap", play("action-oil-spill", { square: 7 }), board([]));

    expect(of(hits, "direct")).toEqual([7]);
    expect(of(hits, "path").sort((a, b) => a - b)).toEqual([6, 8]);
  });

  /**
   * The aura is the reach of the trap and it is drawn at the size the rule uses, three each way, so
   * the mark and the rule cannot disagree about how far "within three squares" goes.
   */
  it("lights an It's Not That Deep's whole aura", () => {
    const hits = castHits("trap", play("action-not-that-deep", { square: 20 }), board([]));

    expect(of(hits, "direct")).toEqual([20]);
    expect(of(hits, "aura")).toHaveLength(NULLIFY_RADIUS * 2);
    expect(of(hits, "aura").sort((a, b) => a - b)).toEqual([17, 18, 19, 21, 22, 23]);
  });

  /** A card whose target never arrived marks nothing rather than marking square `undefined`. */
  it("marks nothing when the square is missing", () => {
    expect(castHits("trap", play("action-banana-peel"), board([])).squares).toEqual([]);
  });
});

describe("the seven cards that press a status onto a piece", () => {
  const pawns = board([
    [0, 0, 5],
    [1, 0, 12],
  ]);

  /** The caster's own piece answering its own card is an `actor`, in the hue and not in the orange. */
  it("marks a Rock's own pawn as the actor", () => {
    const hits = castHits("status", play("action-rock", { pawn: { player: 0, pawn: 0 } }), pawns);

    expect(hits.pawns).toEqual([{ player: 0, pawn: 0, hit: "actor" }]);
  });

  /** A protection arriving is `shielded`: ink, closing onto the shell it will become. */
  it("marks Lock In and Built Different as shielded", () => {
    const ref = { pawn: { player: 0, pawn: 0 } };

    expect(castHits("status", play("action-lock-in", ref), pawns).pawns[0].hit).toBe("shielded");
    expect(castHits("status", play("action-built-different", ref), pawns).pawns[0].hit).toBe(
      "shielded"
    );
  });

  /** Something being done to somebody else is a `victim`: the one colour that means exactly that. */
  it("marks Hold Pawn and Ragebait as victims", () => {
    const ref = { pawn: { player: 1, pawn: 0 } };

    expect(castHits("status", play("reaction-hold-pawn", ref), pawns).pawns[0].hit).toBe("victim");
    expect(castHits("status", play("action-ragebait", ref), pawns).pawns[0].hit).toBe("victim");
  });

  /**
   * Ghost Mode names no pawn at all: it is played into a capture, and the piece it protects is the one
   * the declared move was about to take. Read off `pendingMove`, which is still there while the window
   * is open, and that is the only moment this cast plays in.
   */
  it("finds Ghost Mode's pawn on the declared move", () => {
    const state = {
      ...pawns,
      pendingMove: { player: 0, pawn: 0, captures: { player: 1, pawn: 0 } },
    };
    const hits = castHits("status", play("reaction-ghost-mode"), state);

    expect(hits.pawns).toEqual([{ player: 1, pawn: 0, hit: "shielded" }]);
  });

  it("marks nothing for a Ghost Mode with no capture to answer", () => {
    expect(castHits("status", play("reaction-ghost-mode"), pawns).pawns).toEqual([]);
  });
});

describe("the four cards that move a piece without a move", () => {
  const pawns = board([
    [0, 0, 20],
    [1, 0, 12],
  ]);

  /**
   * A Yeet pushed the pawn **backwards**, so the squares it crossed are the ones now in front of it.
   * The run is drawn from the pawn outward, which is what `--cast-i` staggers.
   */
  it("draws a Yeet's run forwards from where the pawn now stands", () => {
    const hits = castHits("shove", play("action-yeet", { pawn: { player: 1, pawn: 0 } }), pawns, 3);

    expect(hits.pawns).toEqual([{ player: 1, pawn: 0, hit: "victim" }]);
    const from = square(1, 12);
    expect(hits.squares.map((mark) => [mark.square, mark.index])).toEqual([
      [from + 1, 0],
      [from + 2, 1],
      [from + 3, 2],
    ]);
  });

  /** A Let Him Cook ran forwards, so its run is the squares behind the pawn, and its pawn is the actor. */
  it("draws a Let Him Cook's run backwards, and marks its own pawn", () => {
    const hits = castHits(
      "shove",
      play("action-let-him-cook", { pawn: { player: 0, pawn: 0 } }),
      pawns,
      4
    );

    expect(hits.pawns).toEqual([{ player: 0, pawn: 0, hit: "actor" }]);
    const from = square(0, 20);
    expect(of(hits, "path")).toEqual([from - 1, from - 2, from - 3, from - 4]);
  });

  /** Aight Imma Head Out's retreat draws no run: it did not walk back, it jumped. */
  it("draws nothing for the retreat half of Aight Imma Head Out", () => {
    const target = { pawn: { player: 0, pawn: 0 }, choice: "retreat" };
    const hits = castHits("shove", play("action-head-out", target), pawns);

    expect(hits.squares).toEqual([]);
    expect(hits.pawns[0].hit).toBe("actor");
  });

  /** Uno Reverse hits the attacker, which is the pawn on the declared move and never its own target. */
  it("marks Uno Reverse's victim as the attacker", () => {
    const state = { ...pawns, pendingMove: { player: 0, pawn: 0, captures: null } };
    const hits = castHits("shove", play("reaction-uno-reverse"), state);

    expect(hits.pawns).toEqual([{ player: 0, pawn: 0, hit: "victim" }]);
  });

  /** A pawn in its yard is on no square, so there is no run to draw and the mark is the pawn alone. */
  it("draws no run for a pawn that is not on the track", () => {
    const yard = board([[1, 0, 0]]);
    const hits = castHits("shove", play("action-yeet", { pawn: { player: 1, pawn: 0 } }), yard, 4);

    expect(hits.squares).toEqual([]);
  });
});

describe("the three cards that hit more than one field", () => {
  const pawns = board([[0, 0, 10]]);

  /** Hyperbeam's run is the D4 it reported, in the direction the player pointed. */
  it("draws Hyperbeam's beam as long as the die it rolled", () => {
    const target = { pawn: { player: 0, pawn: 0 }, direction: 1 };
    const hits = castHits("area", play("action-hyperbeam", target), pawns, 3);

    const from = square(0, 10);
    expect(of(hits, "path")).toEqual([from + 1, from + 2, from + 3]);
  });

  it("fires Hyperbeam backwards when that is where it was pointed", () => {
    const target = { pawn: { player: 0, pawn: 0 }, direction: -1 };

    const from = square(0, 10);
    expect(of(castHits("area", play("action-hyperbeam", target), pawns, 2), "path")).toEqual([
      from - 1,
      from - 2,
    ]);
  });

  /**
   * Janky RPG asks the same question the effect asked: a 4 or better lands on the named square, and
   * anything less goes wide and touches both neighbours instead.
   */
  it("splashes a Janky RPG that went wide, and not one that landed", () => {
    const target = { square: 30 };

    expect(of(castHits("area", play("action-janky-rpg", target), pawns, 5), "splash")).toEqual([]);
    expect(
      of(castHits("area", play("action-janky-rpg", target), pawns, 2), "splash").sort(
        (a, b) => a - b
      )
    ).toEqual([29, 31]);
  });

  /** The Purge has every target and therefore none: the board itself is what says so. */
  it("marks no field for The Purge", () => {
    const hits = castHits("area", play("reaction-the-purge"), pawns);

    expect(hits.squares).toEqual([]);
    expect(hits.pawns).toEqual([]);
    expect(hits.point).toBeNull();
  });
});

describe("a card an aura cancelled", () => {
  /**
   * D113. The board stage lights the region that refused the card rather than the target it never
   * reached, which is the honest picture of what happened and the only way a player finds out an
   * It's Not That Deep is there at all.
   */
  it("lights the whole region round the square the card was aimed at", () => {
    const hits = auraHits(play("action-banana-peel", { square: 4 }), board([]));

    expect(of(hits, "aura")).toContain(4);
    expect(of(hits, "aura")).toHaveLength(NULLIFY_RADIUS * 2 + 1);
  });

  /** A card aimed at a pawn is answered where that pawn stands, the same way the rule asks it. */
  it("finds the square under a card that was aimed at a pawn", () => {
    const pawns = board([[1, 0, 12]]);
    const hits = auraHits(play("action-yeet", { pawn: { player: 1, pawn: 0 } }), pawns);

    expect(of(hits, "aura").length).toBe(NULLIFY_RADIUS * 2 + 1);
  });

  /** A card that pointed at nothing has no region to light, and says so rather than guessing. */
  it("lights nothing for a card with no place in it", () => {
    expect(auraHits(play("action-angel-die"), board([])).squares).toEqual([]);
  });
});
