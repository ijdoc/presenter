# Presenter

Presenter is a Chrome extension with two jobs:

- **Presenting** — a pointer the audience can follow, and fading rectangles you draw to point at part of a page during a live demo.
- **UX proposals** — switch **enhancements** on and off (a clearer label, a calmer colour) and flip the page between *as shipped* and *proposed*, so one screen recording shows the before and the after.

It started at W&B, so it runs on W&B and CoreWeave Forge pages, plus GitHub and two local dev hosts — the full list is `content_scripts.matches` in [`manifest.json`](manifest.json). Everywhere else it does nothing.

## Installation

1. Clone this repo.
1. Open `chrome://extensions` and turn on **Developer mode**.
1. Click **Load unpacked** and select the repo folder.

There is no build step. Upgrading from a version before 1.1.0: remove the old presenter once first — 1.1.0 pins the extension's ID, so Chrome sees it as a new extension ([ADR-0002](docs/adr/0002-pin-the-extension-id.md)).

## Usage

Click the presenter icon in the toolbar for its switches. Settings apply to every open tab immediately and are remembered.

### Presenting

- **Pointer & highlights** — a small grey circle follows your pointer. Hold **Shift** (the circle turns red) and drag to draw a rectangle that fades after a few seconds. While Shift is held, clicks draw instead of reaching the page.
- **Demo zoom** — zooms the page to 130%, but only when the window has a single tab, so open the demo in its own window and your normal browsing is left alone.

Both are on by default.

### Recording a UX proposal

1. Open the page and switch on the enhancements you want under **Enhancements** — only those that apply to the current page are listed, each with the problem it addresses.
1. Start recording (Loom, or any screen recorder).
1. Press **Alt+Shift+E** to flip between the shipped page and the proposed one. Change the shortcut at `chrome://extensions/shortcuts`; the popup shows the current one.

While any enhancement is showing, an **Enhanced** badge sits in the top-right corner, so whoever watches the clip knows which version they are seeing. With every enhancement off — or the page flipped to *as shipped* — there is no badge and the page is exactly what shipped.

New enhancements are added as files in [`enhancements/`](enhancements/index.js) — see [`CONTRIBUTING.md`](CONTRIBUTING.md) and [ADR-0001](docs/adr/0001-enhancements-are-versioned-files.md).

## Development

See [`CONTRIBUTING.md`](CONTRIBUTING.md) — including the rules for what may never be committed to this public repo.

```bash
npm install     # dev tooling only (Node 24+)
npm run lint
npm test
```
