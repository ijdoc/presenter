import { describe, expect, it } from "vitest";
import { parsePattern, urlMatches } from "../src/lib/match.js";

describe("urlMatches", () => {
  it("matches an exact host and any path", () => {
    expect(urlMatches("https://forge.coreweave.com/org/sandboxes", ["https://forge.coreweave.com/*"])).toBe(true);
  });

  it("matches a wildcard subdomain and the bare domain", () => {
    expect(urlMatches("https://wandb.ai/team/project", ["https://*.wandb.ai/*"])).toBe(true);
    expect(urlMatches("https://api.wandb.ai/x", ["https://*.wandb.ai/*"])).toBe(true);
  });

  it("rejects a host that only contains the target as a substring", () => {
    expect(urlMatches("https://notwandb.ai/", ["https://*.wandb.ai/*"])).toBe(false);
    expect(urlMatches("https://evil.example/?forge.coreweave.com", ["https://forge.coreweave.com/*"])).toBe(false);
    expect(urlMatches("https://forge.coreweave.com.evil.example/", ["https://forge.coreweave.com/*"])).toBe(false);
  });

  it("respects the scheme", () => {
    expect(urlMatches("http://forge.coreweave.com/", ["https://forge.coreweave.com/*"])).toBe(false);
    expect(urlMatches("http://localhost:8080/", ["http://localhost:8080/*"])).toBe(false);
  });

  it("matches path globs, including the query string", () => {
    const patterns = ["https://forge.coreweave.com/*/sandboxes*"];
    expect(urlMatches("https://forge.coreweave.com/acme/sandboxes", patterns)).toBe(true);
    expect(urlMatches("https://forge.coreweave.com/acme/sandboxes?status=all", patterns)).toBe(true);
    expect(urlMatches("https://forge.coreweave.com/acme/notebooks", patterns)).toBe(false);
  });

  it("returns false for something that is not a URL", () => {
    expect(urlMatches("not a url", ["https://*.wandb.ai/*"])).toBe(false);
  });

  it("throws on an invalid pattern rather than silently matching nothing", () => {
    expect(() => parsePattern("forge.coreweave.com")).toThrow(/Invalid match pattern/);
  });
});
