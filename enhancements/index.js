/**
 * The enhancement registry — every proposal the popup can switch on.
 *
 * One file per enhancement in this folder, each exporting an object with:
 *
 *   id       stable kebab-case id; it is the storage key, so never rename one
 *   title    what changes, as the popup shows it ("Ended sandboxes read as Stopped")
 *   problem  the UX problem it addresses, in one sentence — about the product, never about
 *            internal discussions, people or accounts (see CONTRIBUTING.md, "Public repository")
 *   matches  Chrome match patterns for the pages it applies to
 *   css      optional stylesheet text
 *   apply    optional idempotent function(document) for changes CSS cannot make
 *   revert   required with apply: restores exactly what apply changed
 *
 * Add the new file's export to the list below.
 */

export const ENHANCEMENTS = [];
