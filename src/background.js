/**
 * Service worker: the before/after shortcut. An adapter only — the decision lives in
 * src/lib/settings.js.
 */

import { normalizeSettings, STORAGE_KEY, toggleProposed } from "./lib/settings.js";

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-proposed") {
    const stored = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY];
    await chrome.storage.local.set({ [STORAGE_KEY]: toggleProposed(normalizeSettings(stored)) });
  }
});
