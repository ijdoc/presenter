// This repo is public. Committed fixtures must be synthetic: no real email addresses and no
// real resource IDs copied from a logged-in page. Real saved pages belong in the gitignored
// test/fixtures/private/ (see CONTRIBUTING.md, "Public repository").
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const fixtures = join(import.meta.dirname, "fixtures");
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
// Synthetic placeholders that are allowed through.
const ALLOWED = [/@example\.(com|org)\b/, /\b0{8}-0{4}-0{4}-0{4}-0{12}\b/];

function committedFixtures() {
  if (!existsSync(fixtures)) {
    return [];
  }
  return readdirSync(fixtures, { recursive: true })
    .filter((file) => !file.startsWith("private"))
    .filter((file) => /\.(html?|json|txt|js)$/.test(file))
    .map((file) => join(fixtures, file));
}

function scrub(text) {
  return ALLOWED.reduce((result, pattern) => result.replace(new RegExp(pattern, "g"), ""), text);
}

describe("committed fixtures", () => {
  it.each(committedFixtures().map((path) => [path]))("%s holds no real emails or IDs", (path) => {
    const text = scrub(readFileSync(path, "utf8"));
    expect(text).not.toMatch(EMAIL);
    expect(text).not.toMatch(UUID);
  });

  it("the guard itself catches a real-looking email and UUID", () => {
    expect(scrub("contact jane@acme.test")).toMatch(EMAIL);
    expect(scrub("sandbox 12345678-abcd-4ef0-9abc-1234567890ab")).toMatch(UUID);
    expect(scrub("someone@example.com 00000000-0000-0000-0000-000000000000")).not.toMatch(EMAIL);
  });
});
