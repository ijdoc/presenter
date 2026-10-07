/**
 * The settings model — what the popup edits and every content script renders from.
 *
 * Settings live in `chrome.storage.local` under one key so a single `onChanged` event
 * re-renders every open tab. Everything here is pure; the chrome.* reads and writes stay in
 * the adapters (background.js, popup.js, content/main.js).
 */

import { urlMatches } from "./match.js";

export const STORAGE_KEY = "settings";

/**
 * Defaults. Presenting stays on, so an upgrade changes nothing until a switch is flipped;
 * every enhancement starts off and must be turned on deliberately.
 */
export const DEFAULT_SETTINGS = Object.freeze({
  presenting: Object.freeze({ pointer: true }),
  enhancements: Object.freeze({}),
  showProposed: true,
});

/**
 * Fill a stored (possibly partial or missing) settings object with defaults.
 *
 * @param {Object|undefined} stored - The value read from storage
 * @returns {{presenting: {pointer: boolean}, enhancements: Object<string, boolean>, showProposed: boolean}}
 */
export function normalizeSettings(stored) {
  const source = stored && typeof stored === "object" ? stored : {};
  return {
    // Only known features are kept, so a setting from a removed feature (pre-1.1 demo zoom)
    // does not linger in what the popup reads.
    presenting: {
      pointer: typeof source.presenting?.pointer === "boolean" ? source.presenting.pointer : DEFAULT_SETTINGS.presenting.pointer,
    },
    enhancements: { ...(source.enhancements || {}) },
    showProposed: typeof source.showProposed === "boolean" ? source.showProposed : DEFAULT_SETTINGS.showProposed,
  };
}

/**
 * Enhancements that target a URL, whether or not they are switched on — what the popup lists.
 *
 * @param {Array<{id: string, matches: string[]}>} registry - All enhancements
 * @param {string} url - The page URL
 * @returns {Array<Object>}
 */
export function enhancementsForUrl(registry, url) {
  return registry.filter((enhancement) => urlMatches(url, enhancement.matches));
}

/**
 * Enhancements to render on a page right now: switched on, targeting this URL, and the page
 * flipped to the proposed view.
 *
 * @param {Object} settings - Normalized settings
 * @param {Array<{id: string, matches: string[]}>} registry - All enhancements
 * @param {string} url - The page URL
 * @returns {Array<Object>}
 */
export function activeEnhancements(settings, registry, url) {
  if (!settings.showProposed) {
    return [];
  }
  return enhancementsForUrl(registry, url).filter((enhancement) => settings.enhancements[enhancement.id] === true);
}

/**
 * The Enhanced badge shows only while something on screen differs from the shipped page.
 *
 * @param {Array<Object>} active - Result of activeEnhancements
 * @returns {boolean}
 */
export function badgeVisible(active) {
  return active.length > 0;
}

/**
 * Flip between the shipped page and the proposed one — the before/after shortcut.
 *
 * @param {Object} settings - Normalized settings
 * @returns {Object} New settings
 */
export function toggleProposed(settings) {
  return { ...settings, showProposed: !settings.showProposed };
}

/**
 * Switch one enhancement on or off.
 *
 * @param {Object} settings - Normalized settings
 * @param {string} id - Enhancement id
 * @param {boolean} enabled - New state
 * @returns {Object} New settings
 */
export function setEnhancement(settings, id, enabled) {
  return { ...settings, enhancements: { ...settings.enhancements, [id]: enabled } };
}

/**
 * Switch one presenting feature on or off.
 *
 * @param {Object} settings - Normalized settings
 * @param {"pointer"} feature - Presenting feature
 * @param {boolean} enabled - New state
 * @returns {Object} New settings
 */
export function setPresenting(settings, feature, enabled) {
  return { ...settings, presenting: { ...settings.presenting, [feature]: enabled } };
}
