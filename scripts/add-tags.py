"""One-off migration: write the proposed `tags` field into content/papers.bib."""

import re
from pathlib import Path

TAGS = {
    "lai2026spotlightsynergizingseedexploration": "multimodal, ai-infrastructure",
    "chen2026faserfinegrainedphasemanagement": "llm-serving",
    "park2026nexustransparentiooffloading": "serverless, virtualization",
    "zou2026codecsightleveragingvideocodec": "multimodal, llm-serving",
    "gao2026prompttunersloawareelastic": "ai-infrastructure, autoscaling",
    "zhou2026memtrustzerotrustarchitecture": "agentic-ai, security",
    "lai2025tokenscaletimelyaccurate": "llm-serving, autoscaling",
    "kondrashov2025highcostkeepingwarm": "serverless, autoscaling, characterization",
    "kondrashov2026meldingserverlesscontrolplane": "serverless, cluster-management",
    "hong2025slimsc": "agentic-ai",
    "lai2025workloads": "ai-infrastructure, cluster-management",
    "jesalpura2025shattering": "serverless, storage",
    "fu2024serverlessllm": "serverless, llm-serving",
    "ustiugov2023invitro": "serverless, characterization, open-source",
    "schall2022lukewarm": "serverless, characterization, microarchitecture",
    "ustiugov2021stellar": "serverless, characterization, open-source",
    "ustiugov2021snapshots": "serverless, virtualization, open-source",
    "margaritov2021ptemagnet": "virtual-memory, virtualization",
    "margaritov2019prefetched": "virtual-memory, microarchitecture",
    "ustiugov2020bankrupt": "security, rack-scale",
    "margaritov2018learned": "virtual-memory, ml-for-systems",
    "ustiugov2018scm": "memory-systems",
    "drumond2018codesign": "memory-systems",
    "drumond2017mondrian": "memory-systems",
    "novakovic2019rackscale": "rack-scale, memory-systems",
    "daglis2016sabres": "rack-scale",
}

bib = Path("content/papers.bib")
out, seen = [], set()
for chunk in re.split(r"(?=^@)", bib.read_text(), flags=re.M):
    m = re.match(r"@\w+\{([^,]+),", chunk)
    key = m and next((k for k in TAGS if m.group(1).startswith(k)), None)
    if key and "tags" not in re.findall(r"^\s*(\w+)\s*=", chunk, re.M):
        line = re.search(r"^([ \t]*)google_scholar_id(\s*=\s*).*$", chunk, re.M)
        chunk = chunk[: line.end()] + f"\n{line.group(1)}tags{line.group(2)}{{{TAGS[key]}}}," + chunk[line.end():]
        seen.add(key)
    out.append(chunk)
bib.write_text("".join(out))
print(f"tagged {len(seen)}/{len(TAGS)}", sorted(set(TAGS) - seen))
