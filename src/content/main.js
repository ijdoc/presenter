/**
 * Content-script entry point: renders presenting and enhancements from stored settings.
 *
 * This file is the adapter between chrome.* and the plain modules beside it, and should hold
 * no logic of its own (CONTRIBUTING.md, "Keep the browser glue thin").
 */

import { ENHANCEMENTS } from "../../enhancements/index.js";
import { activeEnhancements, badgeVisible, normalizeSettings, STORAGE_KEY } from "../lib/settings.js";
import { setBadge } from "./badge.js";
import { createEnhancer } from "./enhancer.js";
import { createPresenting } from "./presenting.js";

export async function main() {
  const { version } = chrome.runtime.getManifest();
  console.log(`presenter ${version} loaded from ${chrome.runtime.getURL("")}`);

  const linkElement = document.createElement("link");
  linkElement.rel = "stylesheet";
  linkElement.type = "text/css";
  linkElement.href = chrome.runtime.getURL("src/content/presenting.css");
  document.head.appendChild(linkElement);

  const presenting = createPresenting(document, window);
  const enhancer = createEnhancer(document);
  let settings = normalizeSettings((await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY]);

  const render = () => {
    presenting.setEnabled(settings.presenting.pointer);

    const active = activeEnhancements(settings, ENHANCEMENTS, location.href);
    enhancer.sync(active);
    setBadge(document, badgeVisible(active));
  };

  // Forge and W&B route client-side, so the URL and the content change without a reload.
  // Re-render on DOM changes, coalesced to one pass per frame. The observer is event-driven,
  // so it costs nothing once the page is quiet, and render is idempotent, so our own edits
  // settle after one extra pass instead of looping.
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) {
      return;
    }
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      render();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[STORAGE_KEY]) {
      settings = normalizeSettings(changes[STORAGE_KEY].newValue);
      render();
    }
  });

  render();
}
