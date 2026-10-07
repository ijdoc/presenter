/**
 * Chrome-style match patterns, evaluated in plain JS so enhancement targeting is testable.
 *
 * Matching is positive and exact on the origin: `https://forge.coreweave.com/*` matches that
 * host only, and `https://*.wandb.ai/*` matches `wandb.ai` and its subdomains. A substring
 * test would let `https://evil.example/?forge.coreweave.com` through, which is the class of
 * routing bug the tight extension hit (tight#103).
 */

const PATTERN_RE = /^(https?|\*):\/\/(\*|\*\.[^/*]+|[^/*]+)(\/.*)$/;

/**
 * Parse one match pattern into its parts.
 *
 * @param {string} pattern - e.g. "https://*.wandb.ai/*"
 * @returns {{scheme: string, host: string, path: string}}
 * @throws {Error} If the pattern is not a valid match pattern
 */
export function parsePattern(pattern) {
  const parts = PATTERN_RE.exec(pattern);
  if (!parts) {
    throw new Error(`Invalid match pattern: ${pattern}`);
  }
  return { scheme: parts[1], host: parts[2], path: parts[3] };
}

function hostMatches(patternHost, host) {
  if (patternHost === "*") {
    return true;
  }
  if (patternHost.startsWith("*.")) {
    const base = patternHost.slice(2);
    return host === base || host.endsWith("." + base);
  }
  return host === patternHost;
}

function pathMatches(patternPath, path) {
  const escaped = patternPath.split("*").map((piece) => piece.replace(/[.+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp("^" + escaped.join(".*") + "$").test(path);
}

/**
 * Whether a URL matches any of the given match patterns.
 *
 * @param {string} url - The page URL
 * @param {string[]} patterns - Chrome match patterns
 * @returns {boolean}
 */
export function urlMatches(url, patterns) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  const scheme = parsed.protocol.replace(/:$/, "");
  const path = parsed.pathname + parsed.search;
  return patterns.some((pattern) => {
    const { scheme: patternScheme, host, path: patternPath } = parsePattern(pattern);
    const schemeOk = patternScheme === "*" ? scheme === "http" || scheme === "https" : scheme === patternScheme;
    return schemeOk && hostMatches(host, parsed.hostname) && pathMatches(patternPath, path);
  });
}
