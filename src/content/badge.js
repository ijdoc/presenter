/**
 * The Enhanced badge: a small top-centre tag shown only while the page differs from what
 * shipped. At the top because Loom's camera bubble sits bottom-left by default.
 */

export const BADGE_ID = "presenter-enhanced-badge";

/**
 * Show or hide the badge.
 *
 * @param {Document} doc - The page document
 * @param {boolean} visible - Whether any enhancement is active
 */
export function setBadge(doc, visible) {
  const existing = doc.getElementById(BADGE_ID);
  if (!visible) {
    existing?.remove();
    return;
  }
  if (existing) {
    return;
  }
  const badge = doc.createElement("div");
  badge.id = BADGE_ID;
  badge.textContent = "Enhanced";
  badge.setAttribute("aria-hidden", "true");
  (doc.body || doc.documentElement).appendChild(badge);
}
