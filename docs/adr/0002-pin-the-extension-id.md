---
status: accepted
---

# Pin the extension ID so every worktree build shares one settings store

The popup's switches live in `chrome.storage.local`, which Chrome partitions by extension ID, and for an unpacked extension Chrome derives that ID from the folder it was loaded from. Without a pin, every git worktree would be a different extension with empty settings, and loading one would install a second presenter beside the first. We commit a fixed `key` — a base64 DER **public** key — in `manifest.json`, so the ID comes from the key and every build, from any folder, is the same single extension with the same settings. The matching private key was never kept: it is only needed to pack a `.crx` for distribution, which presenter does not do. This mirrors the tight extension's ADR-0004.

## Consequences

- Only one build is live at a time, and nothing on the page says which branch it came from — so every worktree bumps the version as its first commit, and the version at `chrome://extensions` is the marker (CONTRIBUTING.md).
- The ID changed once, when the key was added: the pre-1.1.0 install had a path-derived ID and must be removed once.
- Publishing the public key is harmless; it identifies the extension and cannot sign anything.
