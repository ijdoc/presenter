/**
 * A reversible text relabel — the building block for "say it differently" enhancements.
 *
 * Elements matched by `selector` whose trimmed text equals `from` get `to` as their text and
 * `className` added. The original child nodes are kept (icons included) and put back by
 * `revert`, so the restore is exact. An element the page re-rendered in the meantime is a new
 * node that never carried our edit, so there is nothing to restore on it.
 *
 * `apply` skips elements already showing the new label, so it is idempotent.
 */

const RELABELLED = "data-presenter-relabelled";
const ADDED_CLASS = "data-presenter-added-class";

/**
 * @param {Object} options
 * @param {string} options.selector - CSS selector for candidate elements
 * @param {string} options.from - Exact (trimmed) text to replace, case-insensitive
 * @param {string} options.to - Replacement text
 * @param {string} [options.className] - Class to add while relabelled
 * @returns {{apply: function(Document): void, revert: function(Document): void}}
 */
export function createRelabel({ selector, from, to, className }) {
  const target = from.trim().toLowerCase();
  const originals = new WeakMap();

  const apply = (doc) => {
    for (const element of doc.querySelectorAll(selector)) {
      // Already relabelled and still showing our text: nothing to do. If the page wrote over
      // our text in place (a framework re-render), fall through and relabel the new content.
      if (element.hasAttribute(RELABELLED) && element.textContent === to) {
        continue;
      }
      if (element.textContent.trim().toLowerCase() !== target) {
        continue;
      }
      originals.set(element, [...element.childNodes]);
      element.setAttribute(RELABELLED, "");
      if (className && !element.classList.contains(className)) {
        element.classList.add(className);
        element.setAttribute(ADDED_CLASS, className);
      }
      element.textContent = to;
    }
  };

  const revert = (doc) => {
    for (const element of doc.querySelectorAll(`[${RELABELLED}]`)) {
      if (!originals.has(element)) {
        continue;
      }
      element.replaceChildren(...originals.get(element));
      originals.delete(element);
      element.removeAttribute(RELABELLED);
      const added = element.getAttribute(ADDED_CLASS);
      if (added) {
        element.classList.remove(added);
        element.removeAttribute(ADDED_CLASS);
        if (element.getAttribute("class") === "") {
          element.removeAttribute("class");
        }
      }
    }
  };

  return { apply, revert };
}
