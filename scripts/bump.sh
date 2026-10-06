#!/bin/bash
#
# Bump the extension version — the worktree's first commit.
#
#   scripts/bump.sh           patch bump (the floor)
#   scripts/bump.sh minor     new feature
#   scripts/bump.sh major     breaking change
#   scripts/bump.sh --dry-run print what would happen, change nothing
#
# Why a script: it counts from the HIGHEST version across every active worktree, not from
# this one and not from main. Every build shares one pinned extension ID (ADR-0002), so only
# one build is live at a time and the version at chrome://extensions is the only marker of
# which. Two branches opened from the same main must never claim the same number.
#
# manifest.json is the single source of truth for the version: there is no build step, so
# Chrome reads it directly, and package.json deliberately carries no version.
set -euo pipefail

cd "$(dirname "$0")/.." || exit 1

LEVEL="patch"
DRY_RUN=0

usage() {
    cat <<'USAGE'
Usage: scripts/bump.sh [patch|minor|major] [--dry-run]

  patch   (default) the floor for any worktree
  minor   a new feature
  major   a breaking change

Counts from the highest version across all active worktrees, writes manifest.json,
and commits as "chore(release): bump to <version>".
USAGE
}

for arg in "$@"; do
    case "$arg" in
        patch|minor|major) LEVEL="$arg" ;;
        --dry-run|-n)      DRY_RUN=1 ;;
        -h|--help|help)    usage; exit 0 ;;
        *) echo "❌ Unknown argument: $arg" >&2; usage >&2; exit 1 ;;
    esac
done

# Refuse main: the rule marks a BRANCH's build, and main is the clean anchor Chrome loads.
if [ "$(git rev-parse --abbrev-ref HEAD)" = "main" ]; then
    echo "❌ On main. Bump inside a worktree on its own branch — see CONTRIBUTING.md." >&2
    exit 1
fi

if [ -n "$(git status --porcelain -- manifest.json)" ]; then
    echo "❌ manifest.json has uncommitted changes; commit or discard them first." >&2
    exit 1
fi

# Highest version across every worktree's manifest.json (the primary checkout included).
HIGHEST="$(git worktree list --porcelain | sed -n 's/^worktree //p' | while read -r tree; do
    [ -f "$tree/manifest.json" ] && python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["version"])' "$tree/manifest.json"
done | sort -t. -k1,1n -k2,2n -k3,3n | tail -1)"

NEXT="$(python3 - "$HIGHEST" "$LEVEL" <<'PY'
import sys
major, minor, patch = (int(p) for p in sys.argv[1].split("."))
level = sys.argv[2]
if level == "major":
    major, minor, patch = major + 1, 0, 0
elif level == "minor":
    minor, patch = minor + 1, 0
else:
    patch += 1
print(f"{major}.{minor}.{patch}")
PY
)"

echo "Highest active version: $HIGHEST → $NEXT ($LEVEL)"
[ "$DRY_RUN" -eq 1 ] && exit 0

# Rewrite only the version line so the rest of manifest.json keeps its formatting.
python3 - "$NEXT" <<'PY'
import re, sys
path = "manifest.json"
text = open(path).read()
new, count = re.subn(r'("version"\s*:\s*")[^"]+(")', rf'\g<1>{sys.argv[1]}\g<2>', text, count=1)
if count != 1:
    sys.exit("❌ No version field found in manifest.json")
open(path, "w").write(new)
PY

git add manifest.json
git commit -q -m "chore(release): bump to $NEXT"
echo "✅ Committed chore(release): bump to $NEXT"
