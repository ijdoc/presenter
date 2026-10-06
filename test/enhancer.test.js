// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { createEnhancer, STYLE_ATTRIBUTE } from "../src/content/enhancer.js";
import { createRelabel } from "../src/lib/relabel.js";

const cssOnly = { id: "grey-ended", matches: ["https://forge.coreweave.com/*"], css: ".status { color: grey; }" };
const relabel = createRelabel({ selector: ".status", from: "completed", to: "Stopped" });
const withJs = { id: "say-stopped", matches: ["https://forge.coreweave.com/*"], ...relabel };

describe("createEnhancer", () => {
  let original;

  beforeEach(() => {
    document.head.innerHTML = `<title>t</title>`;
    document.body.innerHTML = `<span class="status">completed</span>`;
    original = document.documentElement.outerHTML;
  });

  it("injects one tagged style per CSS enhancement", () => {
    const enhancer = createEnhancer(document);
    enhancer.sync([cssOnly]);
    enhancer.sync([cssOnly]);
    const styles = document.querySelectorAll(`style[${STYLE_ATTRIBUTE}]`);
    expect(styles).toHaveLength(1);
    expect(styles[0].getAttribute(STYLE_ATTRIBUTE)).toBe("grey-ended");
  });

  it("runs a JS enhancement's apply on every sync", () => {
    const enhancer = createEnhancer(document);
    enhancer.sync([withJs]);
    document.body.insertAdjacentHTML("beforeend", `<span class="status">completed</span>`);
    enhancer.sync([withJs]);
    expect([...document.querySelectorAll(".status")].map((el) => el.textContent)).toEqual(["Stopped", "Stopped"]);
  });

  it("switching everything off returns the exact shipped page", () => {
    const enhancer = createEnhancer(document);
    enhancer.sync([cssOnly, withJs]);
    expect(document.documentElement.outerHTML).not.toBe(original);
    enhancer.sync([]);
    expect(document.documentElement.outerHTML).toBe(original);
    expect(enhancer.activeIds()).toEqual([]);
  });

  it("removes only the enhancements that were switched off", () => {
    const enhancer = createEnhancer(document);
    enhancer.sync([cssOnly, withJs]);
    enhancer.sync([withJs]);
    expect(document.querySelector(`style[${STYLE_ATTRIBUTE}]`)).toBeNull();
    expect(document.querySelector(".status").textContent).toBe("Stopped");
  });

  it("puts its style back if the page replaced <head>", () => {
    const enhancer = createEnhancer(document);
    enhancer.sync([cssOnly]);
    document.head.innerHTML = "";
    enhancer.sync([cssOnly]);
    expect(document.querySelectorAll(`style[${STYLE_ATTRIBUTE}]`)).toHaveLength(1);
  });
});
