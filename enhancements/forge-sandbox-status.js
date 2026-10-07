/**
 * Ended sandboxes in the Forge list read as a grey "Terminated" instead of a green "Completed".
 *
 * Targets data- attributes only: Forge's class names are build-hashed and change between
 * releases. The grey reuses the pill's own colour variables with Forge's neutral values, so
 * the proposed state looks native; fallbacks cover a page where those variables are missing.
 *
 * The overrides are !important because Forge raises its colour rules' specificity by
 * repeating the class (`._green_x._green_x._green_x`), which outranks any plain selector here.
 * They only exist while the enhancement is on, so the shipped page is untouched when off.
 */

import { createRelabel } from "../src/lib/relabel.js";

const CLASS = "presenter-sandbox-ended";

// A ring with a diagonal bar, like the European no-stopping sign. Drawn as a mask so it takes
// the pill's text colour, at the same 24-unit grid and size as the checkmark it replaces.
const ENDED_ICON = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<circle cx="12" cy="12" r="9" fill="none" stroke="black" stroke-width="2"/>' +
    '<path d="M5.6 5.6 18.4 18.4" stroke="black" stroke-width="2" stroke-linecap="round"/>' +
    "</svg>",
);

const relabel = createRelabel({
  selector: 'td[data-key$=":status"] [data-component="Pill"]',
  from: "Completed",
  to: "Terminated",
  className: CLASS,
});

export const forgeSandboxStatus = {
  id: "forge-sandbox-status",
  title: "Ended sandboxes read as grey Terminated",
  problem:
    "An ended sandbox shows a green Completed, which reads as healthy or running; it cannot be started again, so Terminated in neutral grey says what it is.",
  matches: ["https://forge.coreweave.com/sandboxes/*"],
  css: `
[data-component="Pill"].${CLASS} {
  --tag-text-color: var(--secondary-text, #5f6368) !important;
  --tag-background-color: light-dark(var(--moon-200, #e8eaed), var(--moon-800, #3c4043)) !important;
}
[data-component="Pill"].${CLASS} [data-icon] {
  --icon-color: var(--secondary-text, #5f6368) !important;
  position: relative;
}
[data-component="Pill"].${CLASS} [data-icon] svg {
  visibility: hidden;
}
[data-component="Pill"].${CLASS} [data-icon]::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--icon-color);
  -webkit-mask: url("data:image/svg+xml,${ENDED_ICON}") center / contain no-repeat;
  mask: url("data:image/svg+xml,${ENDED_ICON}") center / contain no-repeat;
}
`,
  apply: relabel.apply,
  revert: relabel.revert,
};
