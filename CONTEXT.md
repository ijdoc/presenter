# Presenter

Chrome extension for live product demos: a pointer and fading highlight boxes drawn on the page.

Written in the W&B era to present W&B pages, so it injects only on the domains listed in `manifest.json`. It is jdoc's own tool, not a company product — it changes how a page *looks to the audience*, never what the page does.

## Language

**Pointer**:
The small dot that follows the cursor so the audience can track it — grey when idle, red when **armed**.
_Avoid_: cursor (the OS cursor is separate and still visible), laser, LED (the code's `pointer-led` is the pointer's inner dot, not a separate thing).

**Armed**:
The state while Shift is held: the **pointer** captures mouse events, so a drag draws a **highlight** instead of interacting with the page.
_Avoid_: active, drawing mode, enabled.

**Highlight**:
A rectangle drawn by dragging while **armed**, which fades out on its own a few seconds later. One drag makes one highlight; highlights are never saved or edited.
_Avoid_: annotation (implies it persists), box, selection.

**Demo zoom**:
The fixed zoom the extension applies on load so a shared screen is readable — only when the window holds exactly one tab, so a normal browsing window is left alone.
_Avoid_: scaling, magnify.

**Target site**:
A domain the extension injects on, as listed in `manifest.json`. Anything else is untouched.
_Avoid_: allowed site, whitelist.

## Flagged ambiguities

**Forge is not yet a target site.** `wandb.ai` now redirects some users to `forge.coreweave.com`, which the manifest does not list — so the extension can silently disappear mid-demo after the redirect.

## Example dialogue

> **Dev:** If I hold Shift and click a button on the page, does the button fire?
> **jdoc:** No — while you're **armed** the **pointer** swallows mouse events, so you get a **highlight**, not a click. Let go of Shift and the page behaves normally again.
> **Dev:** And the zoom jumped to 130% in my main browser window.
> **jdoc:** It shouldn't have — **demo zoom** only applies when the window has a single tab. Open the demo in its own window and keep browsing elsewhere.
