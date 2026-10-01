"""One-off migration: add google_scholar_id to each entry in content/papers.bib.

Matches entries to content/citations.yml by normalised title (case, braces and
punctuation ignored). Entries that already have the field are left alone.
"""

import re
import sys
from pathlib import Path

import yaml

BIB = Path("content/papers.bib")
CITATIONS = Path("content/citations.yml")

# Entries whose BibTeX title differs from the Scholar record. ServerlessLLM's
# arXiv title ("Locality-Enhanced") differs from the OSDI'24 one Scholar lists
# ("Low-latency"); same paper.
MANUAL = {"fu2024serverlessllm": "Zph67rFs4hoC"}


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def main() -> int:
    papers = yaml.safe_load(CITATIONS.read_text())["papers"]
    by_title = {norm(v["title"]): k.split(":", 1)[1] for k, v in papers.items()}

    src = BIB.read_text()
    out, missing, added = [], [], 0
    # Split on entry starts, keeping each entry's text intact.
    for chunk in re.split(r"(?=^@)", src, flags=re.M):
        m = re.match(r"@\w+\{([^,]+),", chunk)
        if not m or "google_scholar_id" in chunk:
            out.append(chunk)
            continue
        t = re.search(r"\btitle\s*=\s*\{(.+?)\}\s*,\s*\n", chunk, re.S)
        sid = MANUAL.get(m.group(1)) or (by_title.get(norm(t.group(1))) if t else None)
        if not sid:
            missing.append(m.group(1))
            out.append(chunk)
            continue
        # Insert after the title line, matching that line's indentation.
        line = re.search(r"^([ \t]*)title\s*=.*$", chunk, re.M)
        indent, eq = line.group(1), (" = " if " = " in line.group(0) else "=")
        pos = line.end()
        chunk = chunk[:pos] + f"\n{indent}google_scholar_id{eq}{{{sid}}}," + chunk[pos:]
        out.append(chunk)
        added += 1

    BIB.write_text("".join(out))
    print(f"added {added} ids")
    if missing:
        print("no match:", ", ".join(missing), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
