// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { BADGE_ID, setBadge } from "../src/content/badge.js";

describe("setBadge", () => {
  it("shows one badge while visible and removes it when not", () => {
    setBadge(document, true);
    setBadge(document, true);
    expect(document.querySelectorAll(`#${BADGE_ID}`)).toHaveLength(1);
    expect(document.getElementById(BADGE_ID).textContent).toBe("Enhanced");
    setBadge(document, false);
    expect(document.getElementById(BADGE_ID)).toBeNull();
  });
});
