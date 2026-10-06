/**
 * Popup: switches for presenting and for the enhancements that target the current tab.
 * Writes settings to storage; every open tab re-renders from the change event.
 */

import { ENHANCEMENTS } from "../../enhancements/index.js";
import {
  enhancementsForUrl,
  normalizeSettings,
  setEnhancement,
  setPresenting,
  STORAGE_KEY,
} from "../lib/settings.js";

async function readSettings() {
  return normalizeSettings((await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY]);
}

async function writeSettings(settings) {
  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
}

function enhancementRow(enhancement, enabled) {
  const label = document.createElement("label");
  label.className = "switch";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = enabled;
  input.dataset.enhancement = enhancement.id;
  const text = document.createElement("span");
  text.textContent = enhancement.title;
  const problem = document.createElement("small");
  problem.textContent = enhancement.problem;
  text.appendChild(problem);
  label.append(input, text);
  return label;
}

async function init() {
  document.getElementById("version").textContent = "v" + chrome.runtime.getManifest().version;

  const commands = await chrome.commands.getAll();
  const flip = commands.find((command) => command.name === "toggle-proposed");
  document.getElementById("shortcut").textContent = flip?.shortcut
    ? `${flip.shortcut} flips before/after`
    : "set a shortcut at chrome://extensions/shortcuts";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const settings = await readSettings();

  for (const input of document.querySelectorAll("[data-presenting]")) {
    input.checked = settings.presenting[input.dataset.presenting];
    input.addEventListener("change", async () => {
      await writeSettings(setPresenting(await readSettings(), input.dataset.presenting, input.checked));
    });
  }

  const showProposed = document.getElementById("show-proposed");
  showProposed.checked = settings.showProposed;
  showProposed.addEventListener("change", async () => {
    await writeSettings({ ...(await readSettings()), showProposed: showProposed.checked });
  });

  const forPage = tab?.url ? enhancementsForUrl(ENHANCEMENTS, tab.url) : [];
  const list = document.getElementById("enhancements");
  for (const enhancement of forPage) {
    const row = enhancementRow(enhancement, settings.enhancements[enhancement.id] === true);
    row.querySelector("input").addEventListener("change", async (event) => {
      await writeSettings(setEnhancement(await readSettings(), enhancement.id, event.target.checked));
    });
    list.appendChild(row);
  }
  document.getElementById("empty").hidden = forPage.length > 0;

  // The shortcut can flip the view while the popup is open; keep the switch honest.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[STORAGE_KEY]) {
      showProposed.checked = normalizeSettings(changes[STORAGE_KEY].newValue).showProposed;
    }
  });
}

init().catch((error) => {
  console.error(`presenter popup failed to start: ${error.message}`);
});
