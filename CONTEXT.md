# Presenter

Chrome extension for live demos and UX-proposal clips: pointer, highlights, toggleable enhancements.

Written in the W&B era to present W&B pages, so it injects only on the domains listed in `manifest.json`. It is jdoc's own tool, not a company product — it changes how a page *looks to the audience*, never what the page does.

## Language — presenting

**Pointer**:
The small dot that follows the cursor so the audience can track it — grey when idle, red when **armed**.
_Avoid_: cursor (the OS cursor is separate and still visible), laser, LED (the code's `pointer-led` is the pointer's inner dot, not a separate thing).

**Armed**:
The state while Shift is held: the **pointer** captures mouse events, so a drag draws a **highlight** instead of interacting with the page.
_Avoid_: active, drawing mode, enabled.

**Highlight**:
A rectangle drawn by dragging while **armed**, which fades out on its own a few seconds later. One drag makes one highlight; highlights are never saved or edited.
_Avoid_: annotation (implies it persists), box, selection.

## Language — UX proposals

**Enhancement**:
One proposed change to a product page — a relabel, a colour, a reworded message — defined as a file in `enhancements/` and switched on or off from the popup. An enhancement targets specific pages and, when off, leaves no trace on them.
_Avoid_: mod, patch, fix (it proposes; it fixes nothing), tweak, userstyle.

**As shipped / Proposed**:
The two views of a page: **as shipped** is the real product with every enhancement removed; **proposed** has the switched-on enhancements applied. The before/after shortcut flips between them; one recording shows both.
_Avoid_: before/after as nouns for the views (they describe the clip, not the page), original, modified, live.

**Enhanced badge**:
The small "Enhanced" tag in the top-right corner, present exactly while the **proposed** view differs from **as shipped** — so a viewer of a clip always knows which one they are seeing.
_Avoid_: watermark, label, indicator.

## Language — both

**Target site**:
A domain the extension injects on, as listed in `manifest.json`. Anything else is untouched.
_Avoid_: allowed site, whitelist.

## Flagged ambiguities

**"Before/after"** names the recording, not a view. A clip goes from **as shipped** to **proposed**; say those when you mean the state of the page.

## Example dialogue

> **Dev:** If I hold Shift and click a button on the page, does the button fire?
> **jdoc:** No — while you're **armed** the **pointer** swallows mouse events, so you get a **highlight**, not a click. Let go of Shift and the page behaves normally again.
> **Dev:** I switched on an **enhancement**, but the page looks the same.
> **jdoc:** Check the **Enhanced badge**. No badge means you're on **as shipped** — press the shortcut to flip to **proposed**. If the badge is there and nothing changed, the site's markup moved and the enhancement's selector no longer matches.
