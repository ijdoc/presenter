---
status: accepted
---

# Enhancements are versioned files, not live edits

Presenter's second job is recording UX proposals: switch a page change on, record before and after in one take, and hand the clip to a product team. Each **enhancement** is therefore a file in `enhancements/` — a title, the problem it addresses, the pages it targets, and its CSS (plus an idempotent `apply` and a `revert` when CSS cannot make the change) — registered in `enhancements/index.js` and toggled from the popup. A proposal is only persuasive if it can be reproduced, reviewed and linked; a file in a public repo is all three, and the before/after flip is only honest because every enhancement must restore the shipped page exactly when switched off.

## Considered Options

- **A live CSS editor in the popup, stored in `chrome.storage`** — faster to tinker. Rejected: proposals would live in one browser profile with no history and no link to share, and storage can be lost with the extension.
- **A general userscript manager** (Stylus, Tampermonkey) — rejected: it separates the proposals from the presenting tool they are recorded with, and puts arbitrary-code permissions on every site.

## Consequences

- Writing an enhancement is a code change, so it goes through the repo's normal workflow and review.
- The repo is public, so an enhancement's text — and the fixtures that test it — describe the product's UX and nothing internal (CONTRIBUTING.md, "Public repository").
- Selectors against a third-party site's markup are brittle by nature; an enhancement that silently stops matching does nothing rather than breaking the page, and is fixed when noticed.
