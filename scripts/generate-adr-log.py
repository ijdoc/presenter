#!/usr/bin/env python3
"""Generate the ADR status log (docs/adr/README.md) from ADR frontmatter + git.

The log is a *projection*: it is computed from each `docs/adr/NNNN-*.md` file's
`status` frontmatter and title, with `last-edited` sourced from git. Because it is
derived, it cannot drift from the ADRs it indexes — a mismatch is a stale build,
detectable with `--check`.

This script is intentionally self-contained: standard library only, no reference
to any particular host or toolchain, so a copy committed into any repo runs on its
own. It locates the repo via `git rev-parse`, so it works from any subdirectory.

Usage:
    generate-adr-log.py            # write docs/adr/README.md
    generate-adr-log.py --check    # exit 1 if the on-disk log is stale (for CI)
    generate-adr-log.py --stdout   # print the log, write nothing
    generate-adr-log.py --adr-dir path/to/adr   # override the ADR directory
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

BANNER = "<!-- generated — do not edit. Run scripts/generate-adr-log.py -->"
ADR_FILE_RE = re.compile(r"^(\d{4})-.*\.md$")
SUPERSEDED_RE = re.compile(r"superseded by ADR-(\d{4})", re.IGNORECASE)


def repo_root() -> Path:
    out = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True, text=True, check=True,
    )
    return Path(out.stdout.strip())


def git_last_edited(path: Path) -> str:
    """Date of the last commit that touched `path` (YYYY-MM-DD), or '—' if untracked."""
    out = subprocess.run(
        ["git", "log", "-1", "--format=%ad", "--date=short", "--", str(path)],
        capture_output=True, text=True, check=True,
    )
    return out.stdout.strip() or "—"


def parse_frontmatter(text: str) -> dict[str, str]:
    """Minimal YAML-frontmatter reader: flat `key: value` pairs between `---` fences."""
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    fields: dict[str, str] = {}
    for line in text[3:end].splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip()
    return fields


def first_heading(text: str) -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return "(untitled)"


def collect_adrs(adr_dir: Path) -> list[dict]:
    adrs = []
    for path in sorted(adr_dir.glob("*.md")):
        m = ADR_FILE_RE.match(path.name)
        if not m:
            continue  # skips README.md and any non-ADR files
        text = path.read_text(encoding="utf-8")
        fields = parse_frontmatter(text)
        adrs.append({
            "number": m.group(1),
            "filename": path.name,
            "title": first_heading(text),
            "status": fields.get("status", "accepted").strip() or "accepted",
            "last_edited": git_last_edited(path),
        })
    return adrs


def render_status(status: str, by_number: dict[str, str]) -> str:
    """Turn a raw status into a table cell, linking supersession pointers."""
    m = SUPERSEDED_RE.search(status)
    if m:
        target = m.group(1)
        filename = by_number.get(target)
        link = f"[ADR-{target}]({filename})" if filename else f"ADR-{target}"
        return f"superseded by {link}"
    return status


def render(adrs: list[dict]) -> str:
    by_number = {a["number"]: a["filename"] for a in adrs}
    lines = [
        BANNER,
        "",
        "# Architecture decision records",
        "",
        f"{len(adrs)} record(s). Status is sourced from each ADR's frontmatter; "
        "last-edited from git.",
        "",
        "| ADR | Title | Status | Last edited |",
        "| --- | --- | --- | --- |",
    ]
    for a in adrs:
        title = f"[{a['title']}]({a['filename']})"
        status = render_status(a["status"], by_number)
        lines.append(f"| {a['number']} | {title} | {status} | {a['last_edited']} |")
    lines.append("")
    return "\n".join(lines)


def _date_insensitive(text: str) -> str:
    """Blank the last (last-edited) cell of every table row for --check comparison.

    Git commit dates are one commit behind at generation time, so dates would make
    --check spuriously fail on every ADR change. Comparing date-blanked text still
    enforces presence, title, status, and order.
    """
    out = []
    for line in text.splitlines():
        if line.startswith("|"):
            line = re.sub(r"\|[^|]*\|\s*$", "| |", line)
        out.append(line)
    return "\n".join(out)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate the ADR status log.")
    parser.add_argument("--adr-dir", type=Path, default=None,
                        help="ADR directory (default: <repo>/docs/adr)")
    parser.add_argument("--check", action="store_true",
                        help="exit 1 if the on-disk log is content-stale; write nothing. "
                             "Ignores the last-edited column (git commit dates are "
                             "one commit behind at generation time), so it enforces "
                             "presence/title/status/order, not dates.")
    parser.add_argument("--stdout", action="store_true",
                        help="print the log to stdout; write nothing")
    args = parser.parse_args()

    adr_dir = args.adr_dir or (repo_root() / "docs" / "adr")
    if not adr_dir.is_dir():
        print(f"no ADR directory at {adr_dir}; nothing to do", file=sys.stderr)
        return 0

    content = render(collect_adrs(adr_dir))
    target = adr_dir / "README.md"

    if args.stdout:
        print(content, end="")
        return 0

    if args.check:
        current = target.read_text(encoding="utf-8") if target.exists() else ""
        if _date_insensitive(current) != _date_insensitive(content):
            print(f"{target} is stale — run scripts/generate-adr-log.py to refresh",
                  file=sys.stderr)
            return 1
        return 0

    target.write_text(content, encoding="utf-8")
    print(f"wrote {target}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
