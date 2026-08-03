#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"

tmp_dir="$(mktemp -d)"
tmp_override="${tmp_dir}/distill-override.yml"
tmp_site="${tmp_dir}/site"
distill_collection_dir="$(mktemp -d "${repo_root}/test/distill-fixtures.XXXXXX")"
distill_collection_rel="${distill_collection_dir#"${repo_root}/"}"

cleanup() {
  rm -rf "${tmp_dir}"
  rm -rf "${distill_collection_dir}"
}
trap cleanup EXIT

mkdir -p "${distill_collection_dir}/_posts"

cat >"${distill_collection_dir}/_posts/2021-12-04-distill.md" <<'MARKDOWN'
---
layout: distill
title: Distill integration fixture
date: 2021-12-04 11:59:00-0400
description: Temporary content for validating the packaged Distill renderer.
authors:
  - name: Integration Fixture
    affiliations:
      name: HyScale Lab
      url: https://hyscale-lab.github.io/
bibliography: 2018-12-22-distill.bib
giscus_comments: true
related_posts: false
mermaid:
  enabled: true
tikzjax: true
---

Distill integration fixture.
MARKDOWN

cat >"${tmp_override}" <<YAML
collections_dir: ${distill_collection_rel}
pagination:
  enabled: false
al_folio:
  compat:
    bootstrap:
      enabled: true
giscus:
  repo: alshedivat/al-folio
  repo_id: R_kgDOExample
  category: Comments
  category_id: DIC_kwDOExample
YAML

bundle exec jekyll build --disable-disk-cache --config "_config.yml,${tmp_override}" -d "${tmp_site}" >/dev/null

distill_page="${tmp_site}/blog/2021/distill/index.html"

if [ ! -f "${distill_page}" ]; then
  echo "distill page was not generated at ${distill_page}" >&2
  exit 1
fi

grep -q 'd-front-matter' "${distill_page}"
grep -q '/assets/js/distillpub/template.v2.js' "${distill_page}"
grep -q '/assets/js/distillpub/transforms.v2.js' "${distill_page}"
grep -q '/assets/js/distillpub/overrides.js' "${distill_page}"
grep -q '/assets/al_charts/js/mermaid-setup.js' "${distill_page}"
grep -q 'https://cdn.jsdelivr.net/npm/@planktimerr/tikzjax@1.0.8/dist/fonts.css' "${distill_page}"
grep -q 'https://cdn.jsdelivr.net/npm/@planktimerr/tikzjax@1.0.8/dist/tikzjax.js' "${distill_page}"
grep -q 'id="giscus_thread"' "${distill_page}"
transforms_runtime="${tmp_site}/assets/js/distillpub/transforms.v2.js"
if [ ! -f "${transforms_runtime}" ]; then
  distill_runtime="$(PATH="$HOME/.rbenv/shims:$PATH" bundle exec ruby -e 'spec = Gem.loaded_specs["al_folio_distill"]; puts(spec ? File.join(spec.full_gem_path, "assets/js/distillpub/transforms.v2.js") : "")')"
  if [ -f "${distill_runtime}" ]; then
    transforms_runtime="${distill_runtime}"
  else
    echo "distill transforms runtime missing from the generated site and installed al_folio_distill gem" >&2
    exit 1
  fi
fi

expected_transforms_hash="5d85590f5652b910ab2411019749c83ef5a5a3fbb9b739adc92b4557b6bf3d39"
actual_transforms_hash="$(ruby -rdigest -e 'print Digest::SHA256.file(ARGV[0]).hexdigest' "${transforms_runtime}")"
if [ "${actual_transforms_hash}" != "${expected_transforms_hash}" ]; then
  echo "unexpected distill transforms runtime hash: ${actual_transforms_hash}" >&2
  exit 1
fi

echo "distill integration checks passed"
