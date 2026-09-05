/**
 * What the main menu says. Screen S1, design handoff 12, artboard 12c, decisions D75 to D80.
 *
 * `ui/` only, and **pure**: it takes nothing and returns a description, so the screen can be tested by
 * asking what it says rather than by looking at the DOM. Same split as `pool-screen.js`, and it is here
 * for the same reason: `overlay-screens.js` says of itself that it stays a switch, and the menu stopped
 * being a one-line function the moment it grew from one button to three doors with artwork.
 *
 * ## What changed, and why the menu needed a file
 *
 * The menu used to be one `primary` button on a 432 px panel in the middle of a 1440 by 810 px stage:
 * the emptiest screen in the game, and drawn identically to the screen that asks whether you want to
 * abandon a match. It also offered one thing, so nothing on it said that online play or a settings
 * screen exist at all.
 *
 * It is now three **doors**, dealt across the stage in the game's own card language. That is a look, and
 * `menu.css` owns all of it. What belongs here is the part that is not a look:
 *
 * - **Three items rather than one**, because two of the three are the honest answer to "what else is
 *   there". Online Multiplayer is FR-42 with no technology chosen; Settings is S11, which was deleted.
 * - **They are not equals.** Hotseat is the game, so it is the `primary` one and the other two are
 *   `disabled`. Three doors dealt as equals would say the game has three modes, which is false.
 * - **Every door carries a second line**, including the one that works. On Hotseat it says what the mode
 *   is; on the other two it says why they cannot be used, in two different sentences because there are
 *   two different reasons (D78).
 *
 * ## Why the two dead doors are `disabled` and not filtered
 *
 * `disabled` is a DOM attribute, so a browser fires no click on them and offers no tab stop. That means
 * **no branch in `session-actions.js`**, which is what D77.2 bought, and it means a keyboard user is
 * never dropped on a control where `Enter` does nothing: the same trade spec 05 § 5 made when it took
 * seven tab stops out of the pool overview.
 *
 * The cost is stated rather than hidden: a keyboard-only player tabs to Hotseat and to nothing else, so
 * they learn the other two doors exist by reading the screen. That only works because `hint` is
 * permanent text in the DOM on all three doors, which is why the test asserts it is never empty.
 *
 * **Rejected: `aria-disabled="true"` with the click filtered.** It keeps the item reachable and lets it
 * announce itself as unavailable, and it costs a filter in `session-actions.js`. It buys that only if
 * focusing the door tells a keyboard user something the screen does not already say, and because of D78
 * it does not. If the hint ever stops being permanently on screen, this is the decision that flips.
 */

import { t } from "../i18n/index.js";
import { menuArt } from "./art/index.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "./overlay-vocabulary.js";

/**
 * The three doors, in DOM order, which is also tab order and reading order.
 *
 * One table rather than three literals, so the shape of a door cannot drift between them: every one
 * gets a label, a hint and a drawing, and the only per-door facts are which action it is and whether it
 * works. Hotseat is **first** on purpose, because `focusOverlay` moves the keyboard onto the overlay's
 * first `.overlay__button` and Hotseat is the only one of the three that can take it (D76.4).
 *
 * `variant: "primary"` is the one saturated fill `overlay.css` allows per screen, and Hotseat spends it.
 */
const DOORS = [
  { action: OVERLAY_ACTION.HOTSEAT, variant: "primary" },
  { action: OVERLAY_ACTION.ONLINE, disabled: true },
  { action: OVERLAY_ACTION.SETTINGS, disabled: true },
];

/**
 * One door's button description.
 *
 * The three locale keys are derived from the action rather than listed, which is what keeps a new door
 * from needing a change here as well as in the locale files. **The label is `menu.<action>.label` and
 * not `menu.<action>`**, because a key cannot be a string and an object at the same time in JSON, and
 * the hint has to live under the door it belongs to.
 *
 * `art` is an SVG string or `null`. `null` is survivable: the door renders with an empty first row
 * rather than taking the menu down, the same deal `skillArt` makes for a card, and
 * `tests/unit/ui/card-art.test.js` is what makes sure it never actually happens in a shipped build.
 */
function door({ action, variant, disabled }) {
  return {
    action,
    variant,
    disabled,
    label: t(`menu.${action}.label`),
    hint: t(`menu.${action}.hint`),
    art: menuArt(action),
  };
}

/**
 * S1, the entry point.
 *
 * `title` and `text` keep the keys and the words they have always had. D79 is the decision that they
 * also keep their sizes: the name stays at `--text-xl` and D40 keeps its exclusive on `--text-2xl` for
 * the winner, because on this screen the doors are the loud thing and a 36 px name over them would be a
 * second loud thing on a page with room for one.
 */
export function menuScreen() {
  return {
    screen: OVERLAY_SCREEN.MENU,
    title: t("menu.title"),
    text: t("menu.text"),
    player: null,
    buttons: DOORS.map(door),
  };
}
