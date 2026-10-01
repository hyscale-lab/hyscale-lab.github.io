"""One-off migration: merge al-folio's member files into content/people.yaml.

Reads current_members.yml, former_members.yml and supervisees.yml from the
`main` branch (al-folio layout) and writes the stints model described in
REDESIGN_PLAN.md §5. Run once, then review the output by hand.
"""

import re
import subprocess
import unicodedata
from pathlib import Path

import yaml

GROUP_ROLE = {
    "postdocs": "postdoc",
    "phd_students": "phd",
    "exchange_phd_students": "exchange-phd",
    "research_assistants": "ra",
    "interns": "intern",
}
ROLE_TEXT = {
    "Final-year project student": "fyp",
    "Undergraduate researcher (URECA)": "ureca",
    "Intern": "intern",
    "Research assistant": "ra",
}
NOTE_STINT = re.compile(r"^(FYP|URECA) (\d{4})(?:–(\d{4}))?$")


def load(path: str):
    return yaml.safe_load(subprocess.check_output(["git", "show", f"main:{path}"]))


def slug(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def period(p) -> dict:
    p = str(p)
    m = re.match(r"^(\d{4})(?:–(\d{4}|ongoing))?$", p)
    if not m:
        raise ValueError(f"unparsed period {p!r}")
    start, end = int(m.group(1)), m.group(2)
    if end is None:  # a single year, e.g. "2025"
        return {"start": start, "end": start}
    if end == "ongoing":
        return {"start": start}
    return {"start": start, "end": int(end)}


people: dict[str, dict] = {}


def person(entry: dict) -> dict:
    pid = slug(entry["name"])
    p = people.setdefault(pid, {"id": pid, "name": entry["name"], "stints": []})
    if entry.get("affiliation") and "from" not in p:
        p["from"] = entry["affiliation"]
    if entry.get("url"):
        kind = "linkedin" if "linkedin.com" in entry["url"] else "website"
        p.setdefault("links", {})[kind] = entry["url"].split("?")[0] if kind == "linkedin" else entry["url"]
    return p


def add_stint(p: dict, role: str, per) -> None:
    s = {"role": role, **period(per)}
    if s not in p["stints"]:
        p["stints"].append(s)


def note_stints(p: dict, notes: str | None) -> None:
    m = NOTE_STINT.match(notes or "")
    if m:
        add_stint(p, m.group(1).lower(), f"{m.group(2)}–{m.group(3) or m.group(2)}")


current = load("_data/current_members.yml")
pi = current["principal_investigator"]
p = person(pi)
p["photo"] = True
add_stint(p, "pi", "2023–ongoing")

for src, current_group in (("_data/current_members.yml", True), ("_data/former_members.yml", False)):
    for g in load(src)["groups"]:
        for e in g["members"]:
            p = person(e)
            role = GROUP_ROLE.get(g["key"]) or ROLE_TEXT[e["role"]]
            per = e["period"]
            # Lakshitha: listed as current with a bare "2025"; keep current until confirmed (open item O2).
            if current_group and re.fullmatch(r"\d{4}", str(per)):
                per = f"{per}–ongoing"
            note_stints(p, e.get("notes"))
            add_stint(p, role, per)
            if e.get("destination"):
                p["now"] = e["destination"]

for e in load("_data/supervisees.yml"):
    p = person(e)
    note_stints(p, e.get("notes"))
    add_stint(p, ROLE_TEXT[e["role"]], e["period"])

for p in people.values():
    p["stints"].sort(key=lambda s: s["start"])

HEADER = """\
# HyScale Lab people. One entry per person; see README.md → "Add or update a person".
#
#   id         slug, used for the photo (content/people/photos/<id>.jpg) and ?author=<id>
#   name       display name; also matched against BibTeX author names
#   bib_names  optional extra spellings used in papers.bib (e.g. "D. Ustiugov")
#   from       prior institution, shown on member cards
#   links      website / github / scholar / linkedin / x / email
#   stints     list of { role, start, end }; omit `end` while ongoing
#              roles: pi, postdoc, phd, exchange-phd, ra, intern, fyp, ureca
#   now        where an alumnus went next (shown on the Alumni tab)
#
# Who appears where is computed at build time: a stint with no `end`, or one that
# ends in the current year or later, is current. fyp/ureca stints are listed under
# Supervisees.

"""

out = []
for p in people.values():
    q = {k: p[k] for k in ("id", "name", "from", "links", "stints", "now") if k in p}
    out.append(q)


class Flow(dict):
    pass


yaml.add_representer(Flow, lambda d, v: d.represent_mapping("tag:yaml.org,2002:map", v, flow_style=True))
for q in out:
    q["stints"] = [Flow(s) for s in q["stints"]]
body = yaml.dump(out, sort_keys=False, allow_unicode=True, width=120)
body = re.sub(r"\n- id:", r"\n\n- id:", body)
Path("content/people.yaml").write_text(HEADER + body)
print(f"wrote {len(out)} people")
