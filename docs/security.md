# Security

Presenter runs on logged-in work products and is developed in a public repo. Its security model is short, and each point exists because one of those two facts would otherwise leak something.

## Security model

1. **It changes how a page looks, never what it does.** Enhancements restyle and relabel; they do not submit forms, call APIs, or read data out of the page. A relabel reads an element's text only to decide whether to replace it.
2. **Nothing leaves the browser.** The extension makes no network requests. Settings — which switches are on — are the only thing stored, in `chrome.storage.local`, and they contain no page content.
3. **Least privilege.** `activeTab`, `tabs` (to read the current tab's URL in the popup and apply the single-tab zoom rule) and `storage`. Content scripts inject only on the sites listed in `manifest.json`.
4. **No remotely hosted code, no `eval`.** Every script ships in the extension; MV3's CSP forbids the alternatives, and lint enforces it.
5. **No secrets in the repo.** The manifest `key` is a public key ([ADR-0002](adr/0002-pin-the-extension-id.md)); no private key, token or credential is ever committed.
6. **No real page content in the repo.** Fixtures are synthetic; real saved pages stay in the gitignored `test/fixtures/private/` ([CONTRIBUTING.md](../CONTRIBUTING.md#public-repository-secrets-pii-and-sensitive-information)).

## Reviewer checklist

- [ ] No credentials, tokens, cookies or private keys anywhere in the diff
- [ ] Fixtures are hand-written and synthetic — no names, emails, org/project slugs, resource IDs or internal URLs
- [ ] Enhancement `title`/`problem`, comments, commit messages and PR text describe the UX only — nothing internal
- [ ] No new permission or target site without a stated reason
- [ ] No network request, `eval`, `new Function` or remotely loaded script
- [ ] `console.log` output carries no page content
