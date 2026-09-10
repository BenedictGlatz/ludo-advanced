/**
 * What the settings screen says. Screen S11, reopened by issue #77 on 2026-09-10.
 *
 * `ui/` only, and **pure**: it takes nothing and returns a description, so the screen can be tested by
 * asking what it says rather than by looking at the DOM. Same split as `menu-screen.js` and
 * `lineup-screen.js`, and it is here for the same reason: `overlay-screens.js` stays a switch.
 *
 * ## Why this screen exists again
 *
 * S11 was split and deleted on 2026-09-01: its language half became the one button in the chrome row
 * and its mute half was deferred with issue #40, so the menu's third door was drawn `disabled` with a
 * hint saying where the language switch went (design handoff 12, D77 and D78). The Product Owner asked
 * on 2026-09-10 that the language **also** be changeable from a settings menu: a player who wants to
 * change the language looks for a settings screen first, and a dead door that explains itself is still
 * a dead door.
 *
 * So the door opens onto this screen, and the chrome button stays. Both call the same `changeLanguage`
 * and both redraw the same way; neither remembers the choice, because FR-45 defers persistence and
 * `localStorage` is a lint error in this project.
 *
 * ## What is built, and what is a placeholder
 *
 * **No design spec covers this screen.** It is built from patterns that already exist and nothing
 * else, on the online lobby's precedent (issue #42): the title and sentence every screen has, the
 * line-up's two-position control for the language, `aria-pressed` on the chosen one, and Back. The
 * control names every language in its own tongue, `Deutsch` and `English`, because the one thing a
 * player who cannot read the current language needs is a word they can read. That is the reason the
 * chrome button already names the *target* language. If Claude Design gives the screen a look, the
 * description here is the DOM contract to design against, and it is filed in
 * `01-Design/Handoff/00-open-requests.md`.
 *
 * The language positions are built from `LOCALES` rather than listed, so a third language lands here
 * without a change to this file, which is the same promise `nextLanguage` makes for the chrome button.
 */

import { LOCALES, currentLanguage, t } from "../i18n/index.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "./overlay-vocabulary.js";

/**
 * One language, as one position of the control.
 *
 * `value` becomes `data-value`, which `events.js` hands to `session-actions.js` as `choice`, exactly as
 * the line-up's `human` and `bot` positions do. `pressed` becomes `aria-pressed`, so what the stylesheet
 * raises and what a screen reader announces are one attribute.
 */
function languageChoice(code, current) {
  return {
    action: OVERLAY_ACTION.LANGUAGE,
    value: code,
    label: t(`language.name.${code}`),
    pressed: code === current,
  };
}

/** S11. The language, and a way back to the menu. */
export function settingsScreen() {
  const current = currentLanguage();

  return {
    screen: OVERLAY_SCREEN.SETTINGS,
    title: t("settings.title"),
    text: t("settings.text"),
    player: null,
    buttons: [
      ...Object.keys(LOCALES).map((code) => languageChoice(code, current)),
      { action: OVERLAY_ACTION.BACK, label: t("settings.back") },
    ],
  };
}
