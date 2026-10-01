# HyScale Lab website

Source for [hyscale-lab.github.io](https://hyscale-lab.github.io), the website of the HyScale Systems and Cloud
Architecture Lab at NTU Singapore. Built with [Astro](https://astro.build) and Tailwind CSS. Every push to `main`
builds and publishes the site with GitHub Actions.

> **Edit only `content/`.** Papers, people, posts, news, logos and page text all live there. You don't need to
> know Astro. If something is wrong with a file, the build fails and the error names the file and the field.

## Quick start

Needs Node.js 22.12 or newer and `make`.

```bash
make install       # install dependencies
make start         # dev server in the background at http://localhost:4321 (reloads on edits)
make stop          # stop it
make               # list the other targets: status, logs, build, preview, check, format
```

## Common edits

### Add a paper

Add an entry to `content/papers.bib`. The al-folio fields still work:

```bibtex
@inproceedings{doe2027example,
  title = {An Example Paper Title},
  google_scholar_id = {XXXXXXXXXXXX},
  tags = {serverless, llm-serving},
  author = {Doe, Jane and Ustiugov, Dmitrii},
  booktitle = {USENIX Symposium on Operating Systems Design and Implementation (OSDI)},
  abbr = {OSDI},
  year = {2027},
  pdf = {example-osdi-2027.pdf},
  code = {https://github.com/hyscale-lab/example},
  preview = {doe2027example.webp},
  selected = {true}
}
```

| Field                                      | What it does                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `abbr`                                     | Venue badge. Colour and link come from `content/venues.yaml`; add new venues there.              |
| `tags`                                     | Topic chips used for filtering. Every tag must be listed in `content/tags.yaml`.                 |
| `google_scholar_id`                        | The part after the colon in a Scholar `citation_for_view=…:XXXX` link. Shows the citation count. |
| `pdf`, `slides`                            | A URL, or a file name in `public/assets/pdf/`.                                                   |
| `preview`                                  | A file name in `content/papers/previews/`.                                                       |
| `code`, `video`, `website`, `arxiv`, `doi` | Buttons under the paper.                                                                         |
| `abstract`                                 | Shown by the **Abs** button.                                                                     |
| `award`, `additional_info`                 | Award badge, and a note after the venue.                                                         |
| `selected = {true}`                        | Shown under "Recent highlights" on the landing page.                                             |
| `research_bucket`                          | `current-serverless`, `current-agentic`, … Lists the paper on the matching research pillar page. |

Lab members' names are highlighted and linked automatically when they match a name in `content/people.yaml`.

### Add or update a person

Edit `content/people.yaml`. Each person has one or more **stints**:

```yaml
- id: jane-doe # lowercase-kebab-case; also the photo file name
  name: Jane Doe
  from: Tsinghua University # shown as "Previously …"
  links: { website: https://jane.example, github: https://github.com/jane }
  stints:
    - { role: phd, start: 2026 } # no end = current
```

- **Roles:** `pi`, `postdoc`, `phd`, `exchange-phd`, `ra`, `intern`, `fyp`, `ureca`.
- **Graduation:** add `end: 2028` to the stint and optionally `now: Google, Singapore`. The person moves from
  Current Members to Alumni automatically.
- **Photo:** add `content/people/photos/<id>.jpg` (square works best). Without one, the card shows initials.
- If someone's name is spelled differently in papers, add `bib_names: [J. Doe]`.

### Write a blog post

Create `content/blog/<slug>.md` (or `.mdx`). The URL will be `/blog/<slug>/`.

```yaml
---
title: A post title
description: One sentence for the blog list and link previews.
date: 2026-10-01
tags: [serverless] # from content/tags.yaml
authors: [jane-doe] # ids from content/people.yaml
draft: false # true = built but not listed
---
```

Markdown, code blocks and KaTeX math (`$…$`, `$$…$$`) all work. See the draft post
`content/blog/writing-for-the-blog.md` for examples.

### Add an open-source project

Create `content/projects/<id>.md`. It appears under its pillar on `/research/` and gets a page at
`/research/<pillar>/<id>/` with live GitHub stars:

```yaml
---
title: ARIES
tagline: Agent Runtime & Infrastructure Experimentation System
pillar: agentic # a file name in content/research/
repo: hyscale-lab/ARIES
docs: https://github.com/hyscale-lab/ARIES/blob/main/docs/quick-start.md
license: MIT
image: images/aries-architecture.png # optional figure in content/projects/images/
maintainers: [jooyoung-park] # ids from content/people.yaml
papers: [kondrashov2026rethinkingaicloudinfrastructure] # BibTeX keys
---
Markdown description…
```

### Other content

| What                            | Where                                                           |
| ------------------------------- | --------------------------------------------------------------- |
| News on the landing page        | `content/news.yaml`                                             |
| Sponsor / collaborator logos    | `content/partners.yaml` + image in `content/partners/`          |
| Lab Life photos                 | `content/gallery.yaml` + image in `content/gallery/`            |
| Join us and teaching text       | `content/pages/join.md`, `content/pages/teaching.md`            |
| Research pillars                | `content/research/*.md` (one file per pillar)                   |
| Open-source projects            | `content/projects/*.md` + figures in `content/projects/images/` |
| Tags                            | `content/tags.yaml`                                             |
| Lab name, hero text, navigation | `content/site.yaml`                                             |

## Automation

| Workflow                | When           | What                                                               |
| ----------------------- | -------------- | ------------------------------------------------------------------ |
| `deploy.yml`            | Push to `main` | Build and publish to GitHub Pages                                  |
| `ci.yml`                | Pull requests  | Type check, build, internal link check                             |
| `prettier.yml`          | Push / PR      | Formatting check (`npm run format` fixes)                          |
| `update-citations.yml`  | Mon/Wed/Fri    | Refresh `content/citations.yml` from Google Scholar, then redeploy |
| `broken-links-site.yml` | After deploy   | Internal link check on the built site                              |
| `broken-links.yml`      | Weekly         | External link check on `content/`                                  |
| `axe.yml`               | Manual         | Accessibility check                                                |

GitHub Pages must be set to **Settings → Pages → Source: GitHub Actions**.

## Code layout

```
content/      everything people edit (see above)
src/lib/      loaders and schemas: data.ts (YAML + Zod), bibtex.ts, papers.ts, people.ts, blog.ts
src/pages/    routes: /, /research/<pillar>/<project>/, /publications/, /people/, /blog/, /lab-life/, /teaching/, /join/
src/components/, src/layouts/, src/styles/global.css (design tokens)
scripts/      Scholar citation updater, brand-asset generator, screenshot and smoke-test helpers
public/       files served as-is (PDFs, favicons, robots.txt)
```

## Credits

- The BibTeX parser in `src/lib/bibtex.ts` is adapted from
  [alansynn.github.io](https://github.com/alansynn/alansynn.github.io) (MIT).
- The previous version of this site was built on [al-folio](https://github.com/alshedivat/al-folio) and is kept at
  the git tag `legacy-al-folio`.
- HyScale logo by [Anna Kondrashova](https://www.behance.net/konvpalto00973).
