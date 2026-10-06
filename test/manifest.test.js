// The manifest is the one place a typo silently disables the extension: Chrome skips a
// content script or a module import that does not resolve, without an error on the page.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ENHANCEMENTS } from "../enhancements/index.js";
import { parsePattern, urlMatches } from "../src/lib/match.js";

const root = join(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const targets = manifest.content_scripts[0].matches;

function modulesUnder(dir) {
  return readdirSync(join(root, dir), { recursive: true })
    .filter((file) => file.endsWith(".js"))
    .map((file) => join(dir, file));
}

function covered(path, resources) {
  return resources.some((resource) => {
    const prefix = resource.replace(/\*$/, "");
    return resource.endsWith("*") ? path.startsWith(prefix) && !path.slice(prefix.length).includes("/") : path === resource;
  });
}

describe("manifest.json", () => {
  it("is the single source of the version", () => {
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pkg.version).toBeUndefined();
  });

  it("pins the extension ID with a public key", () => {
    expect(typeof manifest.key).toBe("string");
    expect(manifest.key).not.toMatch(/PRIVATE/);
  });

  it("points at files that exist", () => {
    const files = [
      manifest.background.service_worker,
      manifest.action.default_popup,
      ...manifest.content_scripts.flatMap((script) => script.js),
      ...Object.values(manifest.icons),
    ];
    for (const file of files) {
      expect(existsSync(join(root, file)), file).toBe(true);
    }
  });

  it("exposes every module the content script imports", () => {
    const resources = manifest.web_accessible_resources.flatMap((entry) => entry.resources);
    for (const module of [...modulesUnder("src/content"), ...modulesUnder("src/lib"), ...modulesUnder("enhancements")]) {
      expect(covered(module, resources), module).toBe(true);
    }
  });

  it("targets Forge", () => {
    expect(targets).toContain("https://forge.coreweave.com/*");
  });
});

describe("enhancement registry", () => {
  it("has unique ids", () => {
    const ids = ENHANCEMENTS.map((enhancement) => enhancement.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(ENHANCEMENTS.map((enhancement) => [enhancement.id, enhancement]))("%s is complete", (id, enhancement) => {
    expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(enhancement.title).toBeTruthy();
    expect(enhancement.problem).toBeTruthy();
    expect(enhancement.css || enhancement.apply).toBeTruthy();
    if (enhancement.apply) {
      expect(typeof enhancement.revert).toBe("function");
    }
    for (const pattern of enhancement.matches) {
      // An enhancement can only run where the content script is injected.
      const { scheme, host } = parsePattern(pattern);
      const sample = `${scheme === "*" ? "https" : scheme}://${host.replace(/^\*\./, "")}/`;
      expect(urlMatches(sample, targets), pattern).toBe(true);
    }
  });
});
