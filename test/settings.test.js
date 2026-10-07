import { describe, expect, it } from "vitest";
import {
  activeEnhancements,
  badgeVisible,
  DEFAULT_SETTINGS,
  enhancementsForUrl,
  normalizeSettings,
  setEnhancement,
  setPresenting,
  toggleProposed,
} from "../src/lib/settings.js";

const registry = [
  { id: "forge-one", matches: ["https://forge.coreweave.com/*"] },
  { id: "forge-two", matches: ["https://forge.coreweave.com/*"] },
  { id: "wandb-one", matches: ["https://*.wandb.ai/*"] },
];
const forgeUrl = "https://forge.coreweave.com/org/sandboxes";

describe("normalizeSettings", () => {
  it("returns the defaults when nothing is stored", () => {
    expect(normalizeSettings(undefined)).toEqual({
      presenting: { pointer: true },
      enhancements: {},
      showProposed: true,
    });
  });

  it("keeps stored values and fills in what is missing", () => {
    const settings = normalizeSettings({ presenting: { pointer: false }, enhancements: { "forge-one": true } });
    expect(settings.presenting).toEqual({ pointer: false });
    expect(settings.enhancements).toEqual({ "forge-one": true });
    expect(settings.showProposed).toBe(true);
  });

  it("drops settings from removed features", () => {
    expect(normalizeSettings({ presenting: { pointer: true, zoom: true } }).presenting).toEqual({ pointer: true });
  });

  it("does not hand out the frozen defaults", () => {
    const settings = normalizeSettings(undefined);
    settings.enhancements.x = true;
    expect(DEFAULT_SETTINGS.enhancements).toEqual({});
  });
});

describe("activeEnhancements", () => {
  it("is empty until an enhancement is switched on", () => {
    expect(activeEnhancements(normalizeSettings(undefined), registry, forgeUrl)).toEqual([]);
  });

  it("returns only switched-on enhancements that target the page", () => {
    let settings = normalizeSettings(undefined);
    settings = setEnhancement(settings, "forge-one", true);
    settings = setEnhancement(settings, "wandb-one", true);
    expect(activeEnhancements(settings, registry, forgeUrl).map((e) => e.id)).toEqual(["forge-one"]);
  });

  it("is empty while the page is flipped to the shipped view", () => {
    const settings = toggleProposed(setEnhancement(normalizeSettings(undefined), "forge-one", true));
    expect(settings.showProposed).toBe(false);
    expect(activeEnhancements(settings, registry, forgeUrl)).toEqual([]);
  });
});

describe("enhancementsForUrl", () => {
  it("lists every enhancement for the page, on or off", () => {
    expect(enhancementsForUrl(registry, forgeUrl).map((e) => e.id)).toEqual(["forge-one", "forge-two"]);
  });
});

describe("badgeVisible", () => {
  it("shows only when something on screen differs from the shipped page", () => {
    expect(badgeVisible([])).toBe(false);
    expect(badgeVisible([registry[0]])).toBe(true);
  });
});

describe("setPresenting", () => {
  it("changes one feature and leaves the rest", () => {
    const settings = setPresenting(normalizeSettings(undefined), "pointer", false);
    expect(settings.presenting).toEqual({ pointer: false });
  });
});
