/**
 * Ended sandboxes in the Forge list read as a grey "Terminated" instead of a green "Completed".
 *
 * Targets data- attributes only: Forge's class names are build-hashed and change between
 * releases. The grey reuses the pill's own colour variables with Forge's neutral values, so
 * the proposed state looks native; fallbacks cover a page where those variables are missing.
 */

import { createRelabel } from "../src/lib/relabel.js";

const CLASS = "presenter-sandbox-ended";

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
  --tag-text-color: var(--secondary-text, #5f6368);
  --tag-background-color: light-dark(var(--moon-200, #e8eaed), var(--moon-800, #3c4043));
}
[data-component="Pill"].${CLASS} [data-icon] {
  --icon-color: var(--secondary-text, #5f6368);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
[data-component="Pill"].${CLASS} [data-icon] svg {
  display: none;
}
[data-component="Pill"].${CLASS} [data-icon]::before {
  content: "";
  width: 0.625rem;
  height: 0.625rem;
  border: 1.5px solid currentColor;
  border-radius: 50%;
  box-sizing: border-box;
}
`,
  apply: relabel.apply,
  revert: relabel.revert,
};
