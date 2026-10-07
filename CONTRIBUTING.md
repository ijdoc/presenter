# Contributing to presenter

This guide covers what is **particular to presenter**: the rules a public repo imposes, the disciplines an unpacked Chrome extension with a pinned ID imposes, and where its bugs cluster. For what the extension does and how to use it, see [`README.md`](README.md); for its vocabulary, [`CONTEXT.md`](CONTEXT.md).

Ordinary git and GitHub practice — opening an issue, naming a branch, writing a Conventional Commit, opening a PR — is deliberately not restated here.

## Public repository: secrets, PII and sensitive information

**This repo is public (MIT). Everything committed, and everything written in its issues, PRs and commit messages, is published.** Presenter is used on logged-in work products, so the material it is built and tested against is often confidential. These rules are strict on purpose; when in doubt, leave it out.

**Never commit or post:**

- **Credentials of any kind** — API keys, tokens, cookies, session IDs, `.env` files, private keys. The `key` in `manifest.json` is a *public* key and is the one exception ([ADR-0002](docs/adr/0002-pin-the-extension-id.md)); its private half was never kept, and must never be generated and committed.
- **Saved copies of real pages.** A page saved from a logged-in site carries names, emails, org and project slugs, resource IDs and internal URLs in its markup. Keep real saves in the gitignored `test/fixtures/private/`, and write committed fixtures in `test/fixtures/` **by hand**: the smallest synthetic markup that reproduces the structure, with placeholder text (`acme`, `someone@example.com`, `00000000-0000-0000-0000-000000000000`). `test/fixtures-hygiene.test.js` fails on a real-looking email or UUID, but it is a backstop, not a licence — it cannot recognise a name or an org slug.
- **Personal data** — names, emails, avatars or IDs of anyone but the author, and anything identifying a customer or account.
- **Internal information** — internal Slack channels and threads, unreleased features or roadmap, internal URLs or hostnames, rollout plans, who said what, and screenshots of internal tools.
- **Clips and screenshots.** Loom recordings and images of enhanced pages stay out of the repo; link to them from wherever they are shared internally, never from here.

**Write enhancements about the UX, not about the context.** An enhancement's `title` and `problem` describe what a user sees and why it is confusing ("A stopped sandbox is shown as a green 'completed', which reads as healthy"), never the internal discussion that prompted it, who raised it, or which account hit it. The same goes for comments, tests, commit messages and PR descriptions.

**If something slips through:** removing it in a new commit does not unpublish it — it stays in history and in any fork. Tell the author straight away; rotating a credential comes first, rewriting history second.

See [`docs/security.md`](docs/security.md) for the extension's security model and a reviewer checklist.

## Workflow

Issue → worktree → PR → squash-merge → **reload the extension from the primary checkout**.

- **Work happens in a git worktree, never on the primary checkout.** `~/repos/presenter` stays a clean anchor on `main`, because it is the folder Chrome loads day to day. Worktrees are `presenter-<issue>-<slug>`; the branch is `<type>/<issue>-<slug>`.
- **Run `npm install` once in a new worktree.** It installs the dev tooling only — the extension itself has no build and no runtime dependencies — and writes a `.metadata_never_index` marker so Spotlight stays out of `node_modules` (see *Finishing*).
- **Node 24 or newer.** `.npmrc` sets `engine-strict=true`, so an older node fails at install, naming `engines`, rather than later and obscurely at lint.

### Bump the version as the worktree's first commit

```bash
./scripts/bump.sh              # patch (the floor)
./scripts/bump.sh minor        # a new feature
./scripts/bump.sh major        # a breaking change
./scripts/bump.sh --dry-run    # print the number it would take, change nothing
```

The script counts from the **highest version across every active worktree** — two branches from the same `main` must never claim the same number — writes `manifest.json`, and commits `chore(release): bump to <version>`. It refuses to run on `main`.

**Why first:** every build shares one pinned extension ID ([ADR-0002](docs/adr/0002-pin-the-extension-id.md)), so only one build is live at a time, and the version at `chrome://extensions` (also shown in the popup and logged to the page console on load) is the only marker of which. **`manifest.json` is the single source of the version** — there is no build to inject it, and `package.json` deliberately has none; `test/manifest.test.js` fails if one appears.

Merging conflicts on the version line whenever a sibling branch merged first. **Resolve by taking the higher number** — never by reverting a bump.

### Iterating

**Load unpacked** on the worktree folder at `chrome://extensions`. Because the ID is pinned, this **repoints** the one installed presenter at the worktree, keeping its settings — don't remove the existing one first. After a code change, press the reload icon on the extension's card, then reload the page.

If a change seems to have no effect, check the path on the extension's card is the worktree you just edited. The page console logs `presenter <version> loaded from …` on every load; that line is the fastest confirmation you are testing what you think you are.

## Finishing

After the squash-merge, tear down from the primary checkout, then point Chrome back at it:

```bash
cd ~/repos/presenter
# 1. Delete the local branch BEFORE any fetch — under squash merge, -d only passes while the
#    stale origin/<branch> ref still exists, and any fetch drops it.
git worktree remove --force ../presenter-<issue>-<slug> || {
    # "Directory not empty": Spotlight was reading node_modules. Safe here — the merge happened.
    rm -rf ../presenter-<issue>-<slug>
    git worktree prune
}
git branch -d <type>/<issue>-<slug>
git fetch --prune

# 2. Update the folder Chrome loads, and reload it.
git pull --ff-only
# then Load unpacked → ~/repos/presenter (or press reload if it already points there)
```

If you already fetched, `-d` fails with *"not fully merged"*: confirm the PR merged (`gh pr view <N>`) and use `-D`. `--force` discards uncommitted changes in the worktree, which is safe only after the merge — never run it out of order.

## Commit scopes

| Scope | Surface |
| --- | --- |
| `presenting` | pointer and highlights |
| `enhancements` | the registry and individual enhancements |
| `popup` | the toolbar popup |
| `content` | the content-script entry point, enhancer and badge |
| `background` | the service worker |
| `repo` | layout, tooling, CI |
| `deps` | dev dependencies |

Always commit `package-lock.json` with `package.json`.

## Code style

`npm run lint` enforces the mechanical part ([`eslint.config.mjs`](eslint.config.mjs)). Beyond it:

- **No `eval`, no `new Function`.** An MV3 extension runs under a CSP that forbids both, so either is a runtime failure on the page; lint enforces it.
- **Keep the browser glue thin.** `src/background.js`, `src/popup/popup.js` and `src/content/main.js` are adapters between `chrome.*` and plain modules; decisions — which page matches, what is active, when the badge shows — live in `src/lib/` and `src/content/` modules that take a `document` and are tested under jsdom. If an adapter needs a comment explaining what it decides, the decision belongs in a module.
- **Match pages by origin, never by substring.** Every enhancement names its pages as Chrome match patterns, evaluated by `src/lib/match.js`; anything else is left alone.
- Two-space indentation, braces on the same line, double quotes, semicolons — as the original code. No formatter.
- JSDoc on exported functions; informative errors, no silent `catch`.

## Review focus areas

Bugs cluster here — scrutinise changes that touch them:

- **Reversibility.** Switching an enhancement off must return the exact shipped page, or the before/after clip is dishonest. `test/enhancer.test.js` and `test/relabel.test.js` compare the DOM before and after; every new enhancement with an `apply` needs the same test.
- **Single-page routing.** Forge and W&B change the URL and content without reloading. The content script re-renders on DOM changes; `apply` runs repeatedly and must be idempotent, or our own edits retrigger the observer in a loop.
- **Selectors against third-party markup.** They break without notice when the site ships. Test against a hand-written fixture in `test/fixtures/`, never a real saved page (see *Public repository*).
- **The manifest.** A content script, popup or module import that does not resolve fails silently in Chrome. `test/manifest.test.js` checks the paths and that every module is a web-accessible resource.
- **Permissions.** Presenter holds `activeTab` and `storage` and injects only on the sites in `manifest.json`. Adding a permission or a target site needs a reason in the PR.

## Documentation

- [`README.md`](README.md) — what it does, install, usage.
- [`CONTEXT.md`](CONTEXT.md) — the glossary, when a change moves the vocabulary.
- [`docs/adr/`](docs/adr/README.md) — a new ADR for a hard-to-reverse decision. ADRs are content-immutable: when one turns out wrong, change its `status` and write a successor. Regenerate the log with `python3 scripts/generate-adr-log.py` (CI checks it is current).

## Checklist

- [ ] Version bumped as the worktree's first commit
- [ ] `npm run lint` and `npm test` pass
- [ ] Tried in Chrome on the worktree build, on the live page
- [ ] Nothing from *Public repository* in the diff, the PR text or the commit messages
- [ ] Docs updated alongside the code
