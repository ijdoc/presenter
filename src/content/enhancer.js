/**
 * Applies and removes enhancements on one document.
 *
 * Every enhancement must be fully reversible without a reload: switching it off returns the
 * page to exactly what shipped, because the before/after flip is only honest if "before" is
 * the real page. CSS is injected as one tagged <style> per enhancement; JS enhancements
 * provide an idempotent `apply` and a `revert`.
 *
 * `sync` is called on every page change (Forge re-renders without reloading), so `apply`
 * runs repeatedly and must be a no-op when there is nothing new to change — otherwise our
 * own edits would retrigger the observer that calls us.
 */

export const STYLE_ATTRIBUTE = "data-presenter-enhancement";

/**
 * @param {Document} doc - The page document
 * @returns {{sync: function(Array<Object>): void, activeIds: function(): string[]}}
 */
export function createEnhancer(doc) {
  const applied = new Map();

  const addStyle = (enhancement) => {
    const style = doc.createElement("style");
    style.setAttribute(STYLE_ATTRIBUTE, enhancement.id);
    style.textContent = enhancement.css;
    (doc.head || doc.documentElement).appendChild(style);
    return style;
  };

  const sync = (active) => {
    const wanted = new Set(active.map((enhancement) => enhancement.id));

    for (const [id, entry] of applied) {
      if (!wanted.has(id)) {
        entry.style?.remove();
        entry.enhancement.revert?.(doc);
        applied.delete(id);
      }
    }

    for (const enhancement of active) {
      let entry = applied.get(enhancement.id);
      if (!entry) {
        entry = { enhancement, style: enhancement.css ? addStyle(enhancement) : null };
        applied.set(enhancement.id, entry);
      } else if (entry.style && !entry.style.isConnected) {
        // The page replaced <head>; put our rules back.
        entry.style = addStyle(enhancement);
      }
      enhancement.apply?.(doc);
    }
  };

  return { sync, activeIds: () => [...applied.keys()] };
}
