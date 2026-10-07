// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { createEnhancer } from "../src/content/enhancer.js";
import { forgeSandboxStatus } from "../enhancements/forge-sandbox-status.js";
import { urlMatches } from "../src/lib/match.js";

const fixture = readFileSync(join(import.meta.dirname, "fixtures", "forge-sandbox-list.html"), "utf8");
const statusPills = () => [...document.querySelectorAll('td[data-key$=":status"] [data-component="Pill"]')];

describe("forge-sandbox-status", () => {
  let original;

  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = fixture;
    original = document.documentElement.outerHTML;
  });

  it("targets the sandboxes pages only", () => {
    expect(urlMatches("https://forge.coreweave.com/sandboxes/example-sandboxes", forgeSandboxStatus.matches)).toBe(true);
    expect(urlMatches("https://forge.coreweave.com/notebooks", forgeSandboxStatus.matches)).toBe(false);
  });

  it("relabels a Completed status pill and keeps its icon", () => {
    const [ended] = statusPills();
    const icon = ended.querySelector("[data-icon]");
    forgeSandboxStatus.apply(document);
    expect(ended.textContent.trim()).toBe("Terminated");
    expect(ended.classList.contains("presenter-sandbox-ended")).toBe(true);
    expect(ended.querySelector("[data-icon]")).toBe(icon);
  });

  it("leaves other statuses and Completed pills outside the status column alone", () => {
    forgeSandboxStatus.apply(document);
    const [, running] = statusPills();
    expect(running.textContent.trim()).toBe("Running");
    expect(document.querySelector('[data-key$=":displayName"] [data-component="Pill"]').textContent).toBe("Completed");
  });

  it("restores the shipped page exactly when switched off", () => {
    const enhancer = createEnhancer(document);
    enhancer.sync([forgeSandboxStatus]);
    expect(document.documentElement.outerHTML).not.toBe(original);
    enhancer.sync([]);
    expect(document.documentElement.outerHTML).toBe(original);
  });

  it("is idempotent across repeated syncs", () => {
    const enhancer = createEnhancer(document);
    enhancer.sync([forgeSandboxStatus]);
    const once = document.documentElement.outerHTML;
    enhancer.sync([forgeSandboxStatus]);
    expect(document.documentElement.outerHTML).toBe(once);
  });
});
