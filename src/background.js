/**
 * Service worker: the zoom request and the before/after shortcut. An adapter only — the
 * decisions live in src/lib/settings.js.
 */

import { normalizeSettings, STORAGE_KEY, toggleProposed } from "./lib/settings.js";

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "setZoomLevel" && sender.tab) {
    // Only apply zoom if the window contains exactly 1 tab
    chrome.tabs.query({ windowId: sender.tab.windowId }, (tabs) => {
      if (tabs.length === 1) {
        chrome.tabs.setZoom(sender.tab.id, request.zoomLevel);
      }
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-proposed") {
    const stored = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY];
    await chrome.storage.local.set({ [STORAGE_KEY]: toggleProposed(normalizeSettings(stored)) });
  }
});
