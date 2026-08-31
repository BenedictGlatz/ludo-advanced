/**
 * The 29 skill cards as one list, checked at load. Issue #38, requirements FR-26 and FR-28.
 *
 * ## Why it validates itself at import time
 *
 * The catalogue is hand-transcribed from an artboard, and the mistakes that kind of transcription
 * produces are all quiet: a duplicated id, a typo in a category, a Reaction card whose trigger is the
 * action phase. None of those throws when it happens, and all of them turn into a card that cannot be
 * played or a card the view cannot label, weeks later.
 *
 * So `assertCatalogue` runs when the module loads, which means a broken entry stops the game at boot
 * with a message naming the card. A test would catch it too, and later: this catches it in the browser
 * as well, for anyone editing the list.
 */

import { CATEGORY, COPIES_PER_CARD, KIND, TARGET, TRIGGER, TYPE } from "./vocabulary.js";
import { CORE_CARDS } from "./catalogue-core.js";
import { EXTRA_CARDS } from "./catalogue-extra.js";

const VALUES = {
  type: Object.values(TYPE),
  category: [...Object.values(CATEGORY), null],
  kind: Object.values(KIND),
  targets: Object.values(TARGET),
  triggers: Object.values(TRIGGER),
};

/** The windows a Reaction may be played into. An Action may only ever have the action phase. */
const REACTION_TRIGGERS = [TRIGGER.ON_CARD, TRIGGER.ON_ROLL, TRIGGER.ON_CAPTURE];

function assertCard(card) {
  const fail = (message) => {
    throw new Error(`card "${card.id}": ${message}`);
  };

  if (!VALUES.type.includes(card.type)) fail(`unknown type "${card.type}"`);
  if (!VALUES.category.includes(card.category)) fail(`unknown category "${card.category}"`);
  if (!VALUES.kind.includes(card.kind)) fail(`unknown kind "${card.kind}"`);

  if (!card.id.startsWith(`${card.type}-`)) {
    fail(`the id must start with the card's own type, "${card.type}-"`);
  }
  if (!/^[a-z]+(-[a-z0-9]+)+$/.test(card.id)) fail("an id is lower-case ASCII and hyphens only");

  if (card.targets.length === 0) fail("targets must list at least TARGET.NONE");
  for (const target of card.targets) {
    if (!VALUES.targets.includes(target)) fail(`unknown target "${target}"`);
  }
  if (card.targets.includes(TARGET.NONE) && card.targets.length > 1) {
    fail("TARGET.NONE cannot be combined with another target");
  }

  if (card.triggers.length === 0) fail("triggers must list at least one moment");
  for (const trigger of card.triggers) {
    if (!VALUES.triggers.includes(trigger)) fail(`unknown trigger "${trigger}"`);
  }

  // The one cross-field rule that is a real rule rather than a spelling check: FR-23 and FR-24 say an
  // Action is playable only on your own turn and a Reaction only during someone else's.
  const allowed = card.type === TYPE.ACTION ? [TRIGGER.ACTION_PHASE] : REACTION_TRIGGERS;
  for (const trigger of card.triggers) {
    if (!allowed.includes(trigger)) {
      fail(`type "${card.type}" cannot trigger on "${trigger}"`);
    }
  }
}

/**
 * Check a list of card entries, or throw naming the card and the problem.
 *
 * Exported so the tests can feed it broken entries. The shipped catalogue is valid, which means every
 * refusal below is a branch no test would otherwise reach, and an unreachable guard is a guard nobody
 * knows still works.
 */
export function assertCatalogue(cards) {
  const seen = new Set();

  for (const card of cards) {
    if (seen.has(card.id)) throw new Error(`card "${card.id}" is in the catalogue twice`);
    seen.add(card.id);
    assertCard(card);
  }

  return cards;
}

/** Every skill card, artboard `6a` first and then `4a`. Frozen: the catalogue is read, never edited. */
export const SKILL_CARDS = Object.freeze(
  assertCatalogue([...CORE_CARDS, ...EXTRA_CARDS]).map((card) =>
    Object.freeze({
      ...card,
      targets: Object.freeze([...card.targets]),
      triggers: Object.freeze([...card.triggers]),
    })
  )
);

const BY_ID = new Map(SKILL_CARDS.map((card) => [card.id, card]));

/** How many distinct cards exist. 29 by the Product Owner's choice of the whole artwork set. */
export const CARD_COUNT = SKILL_CARDS.length;

/** How many cards the pool holds when nothing has been drawn: 29 cards, two copies each. */
export const POOL_SIZE = CARD_COUNT * COPIES_PER_CARD;

/**
 * One card by its id, or `undefined`.
 *
 * A `Map` and not a `find`, because the target picker and the card view look a card up on every render
 * and a linear scan over 29 entries per card per frame is work for nothing.
 */
export function cardById(id) {
  return BY_ID.get(id);
}

/** Every card of one type. `ui/` uses this to ask "what could this player possibly play right now". */
export function cardsOfType(type) {
  return SKILL_CARDS.filter((card) => card.type === type);
}

/** Every card that can be played into one window, which is the reaction prompt's whole question. */
export function cardsForTrigger(trigger) {
  return SKILL_CARDS.filter((card) => card.triggers.includes(trigger));
}

/** Every id, in catalogue order. Used by the test that checks the locales name all of them. */
export function cardIds() {
  return SKILL_CARDS.map((card) => card.id);
}
