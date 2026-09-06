/**
 * What a pawn's tooltip says about the statuses it carries. Issue #94.
 *
 * `ui/` only: it calls `t()` and holds no rule. Its own file rather than a function in `board-marks.js`
 * for the reason `player-labels.js` gives: that file imports jQuery, and jQuery refuses to load without a
 * window, so a wording test there would need a DOM for a function that never touches one.
 *
 * ## Why a native `title` and not a designed tooltip
 *
 * A playtester tried to capture a pawn, could not, and read it as a bug on the square. The pawn was
 * carrying a protection (Lock In or Built Different), the message strip named the refusal, and the pawn
 * itself showed nothing: `board-marks.js` writes `data-statuses` and design spec 07 styled two of the
 * nine kinds. A `title` is text and not a look, so it ships without a design decision. The drawn marks
 * for the remaining kinds, and a designed tooltip to replace this one, are owed by design brief 17.
 */

import { t } from "../i18n/index.js";

/**
 * One clause per status kind, joined with the locale's separator, or `null` when the pawn carries
 * nothing so the attribute is removed rather than left empty.
 */
export function statusTitle(kinds) {
  if (kinds.length === 0) return null;

  return kinds.map((kind) => t(`status.${kind}`)).join(t("status.separator"));
}
