# Agent guidelines

Astro + Tailwind CSS static site for HyScale Lab, deployed to GitHub Pages by `.github/workflows/deploy.yml`.

## The one rule

**Content lives only in `content/`; code lives only in `src/`.** A lab member adding a paper, person, post, news
item or logo should only ever touch files in `content/` (plus PDFs in `public/assets/pdf/`). If a content change
seems to need a code change, the schema or loader in `src/lib/` is missing a field. Add the field there,
validated, rather than hard-coding content in a component.

## Where things are

| Change                              | Edit                                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Papers                              | `content/papers.bib` (parsed by `src/lib/bibtex.ts`, modelled in `src/lib/papers.ts`)                                  |
| People                              | `content/people.yaml` (stints model, `src/lib/people.ts`)                                                              |
| Other YAML schemas                  | `src/lib/data.ts`: every YAML file in `content/` has a Zod schema there                                                |
| Blog, project and page front matter | `src/content.config.ts`                                                                                                |
| Design tokens (colours, fonts)      | `src/styles/global.css`: use the token names (`bg-surface`, `text-muted`, `border-line`, `text-brand`, …), not raw hex |
| Landing page sections               | `src/components/sections/`                                                                                             |
| Filters (publications, blog)        | `src/scripts/filter.ts`; state lives in the URL                                                                        |

## Invariants

- **Fail loudly.** Bad content should stop the build with the file and field named (`[content] content/<file> …`),
  never render a blank card. Keep that when adding fields.
- **Tags** must exist in `content/tags.yaml`; checked for papers, posts and `site.yaml` pillars.
- **Old URLs must keep working.** `/people/current-members/`, `/people/former-members/`, `/people/supervisees/` and
  `/alumni/` are redirects in `astro.config.mjs`; `/assets/pdf/*` is served from `public/assets/pdf/`.
- **Light is the default theme.** Dark mode is the `dark` class on `<html>`; check new UI in both.
- **Page transitions** use Astro's `ClientRouter`: page scripts must run on `astro:page-load`, not
  `DOMContentLoaded`.
- `content/citations.yml` is written by `update-citations.yml`; don't edit it by hand.

## Commands

```bash
npm install
npm run dev
npm run check    # astro check (types)
npm run build    # must pass before committing
npm run format   # Prettier (printWidth 120, prettier-plugin-astro)
# With a preview server running (npx astro preview):
node scripts/smoke-test.mjs http://localhost:4321    # browser checks: filters, redirects, theme
node scripts/screenshot.mjs http://localhost:4321 /tmp/shots / /publications/@390 /:dark
```
