// Loads and validates the YAML files in content/. Every file is parsed against
// a Zod schema at build time, so a typo stops the build with the file name and
// the offending field instead of silently rendering a blank card.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { z } from 'astro/zod';

const CONTENT_DIR = resolve(process.cwd(), 'content');
const isProd = import.meta.env?.PROD ?? process.env.NODE_ENV === 'production';

const year = z.number().int().min(1990).max(2100);
const url = z.url();

export const ROLES = ['pi', 'postdoc', 'phd', 'exchange-phd', 'ra', 'intern', 'fyp', 'ureca'] as const;
export type Role = (typeof ROLES)[number];

const link = z.object({ label: z.string(), href: z.string() }).strict();
const heading = z.object({ eyebrow: z.string().optional(), title: z.string(), lead: z.string().optional() }).strict();
const pageHeader = z
  .object({
    page_title: z.string(),
    eyebrow: z.string().optional(),
    title: z.string(),
    description: z.string(),
    lead: z.string(),
  })
  .strict();

const tagDef = z
  .object({ id: z.string().regex(/^[a-z0-9-]+$/, 'tag ids are lowercase-kebab-case'), label: z.string() })
  .strict();

const schemas = {
  'site.yaml': z.object({
    name: z.string(),
    full_name: z.string(),
    institution: z.string(),
    institution_url: url,
    url,
    description: z.string(),
    contact: z.object({ email: z.email(), pi: z.string() }),
    socials: z.record(z.string(), url),
    scholar_userid: z.string(),
    google_site_verification: z.string().optional(),
    nav: z.array(z.object({ label: z.string(), href: z.string() })),
  }),
  'home.yaml': z
    .object({
      hero: z.object({
        image: z.string(),
        eyebrow: z.string(),
        title: z.string(),
        subtitle: z.string(),
        primary: link,
        secondary: link.optional(),
      }),
      pillars: heading.optional(),
      stats: z
        .array(z.object({ stat: z.enum(['publications', 'citations', 'members', 'stars']), label: z.string() }))
        .optional(),
      open_source: z
        .object({ eyebrow: z.string(), projects: z.array(z.string()).min(1), autoplay: z.number().min(0).default(0) })
        .strict()
        .optional(),
      publications: heading.extend({ limit: z.number().int().min(1).default(4), link_label: z.string() }).optional(),
      news: heading.extend({ limit: z.number().int().min(1).default(5) }).optional(),
      team: heading
        .extend({
          text: z.string(),
          images: z.array(z.object({ image: z.string(), alt: z.string() }).strict()).min(1),
          autoplay: z.number().min(0).default(0),
          primary: link.optional(),
          secondary: link.optional(),
        })
        .optional(),
      blog: heading.extend({ limit: z.number().int().min(1).default(3) }).optional(),
      partners: heading.optional(),
      cta: z
        .object({ title: z.string(), text: z.string(), primary: link, secondary: link.optional() })
        .strict()
        .optional(),
    })
    .strict(),
  'page-headers.yaml': z
    .object({
      publications: pageHeader,
      people: pageHeader,
      research: pageHeader,
      blog: pageHeader,
      lab_life: pageHeader,
      not_found: z.object({ title: z.string(), lead: z.string(), links: z.array(link) }).strict(),
      join_box: z.object({ text: z.string(), button: z.string() }).strict(),
      footer: z.object({ nav_title: z.string(), contact_title: z.string(), contact_text: z.string() }).strict(),
    })
    .strict(),
  'people.yaml': z.array(
    z
      .object({
        id: z.string().regex(/^[a-z0-9-]+$/, 'ids are lowercase-kebab-case'),
        name: z.string(),
        bib_names: z.array(z.string()).optional(),
        title: z.string().optional(),
        bio: z.string().optional(),
        from: z.string().optional(),
        links: z
          .object({
            website: url,
            github: url,
            scholar: url,
            linkedin: url,
            x: url,
            email: z.email(),
          })
          .partial()
          .strict()
          .optional(),
        stints: z.array(z.object({ role: z.enum(ROLES), start: year, end: year.optional() }).strict()).min(1),
        now: z.string().optional(),
      })
      .strict(),
  ),
  'tags.yaml': z
    .object({
      main: z.array(tagDef).min(1),
      sub: z.array(tagDef.extend({ main: z.string() })),
      extra: z.array(tagDef).default([]),
    })
    .strict(),
  'venues.yaml': z.record(z.string(), z.object({ color: z.string(), url: url.optional() })),
  'partners.yaml': z.array(
    z
      .object({ name: z.string(), logo: z.string(), url: url.optional(), type: z.enum(['sponsor', 'collaborator']) })
      .strict(),
  ),
  'news.yaml': z.array(
    z.object({ date: z.coerce.date(), text: z.string(), tags: z.array(z.string()).optional() }).strict(),
  ),
  'gallery.yaml': z.array(
    z.object({ image: z.string(), alt: z.string(), caption: z.string().optional(), date: z.string().optional() }),
  ),
  'citations.yml': z.object({
    metadata: z.object({ last_updated: z.string() }),
    papers: z.record(z.string(), z.object({ citations: z.number(), title: z.string(), year: z.coerce.string() })),
  }),
} as const;

type Schemas = typeof schemas;
export type ContentFile = keyof Schemas;
export type Content<F extends ContentFile> = z.infer<Schemas[F]>;

const cache = new Map<string, unknown>();

/** Read and validate content/<file>. Cached in production builds only, so edits show up in `astro dev`. */
export function load<F extends ContentFile>(file: F): Content<F> {
  if (isProd && cache.has(file)) return cache.get(file) as Content<F>;
  const raw = parseYaml(readFileSync(resolve(CONTENT_DIR, file), 'utf-8'));
  const res = schemas[file].safeParse(raw);
  if (!res.success) {
    const issues = res.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
    throw new Error(`[content] content/${file} is invalid:\n${issues}`);
  }
  cache.set(file, res.data);
  return res.data as Content<F>;
}

export const site = () => load('site.yaml');

export type TagKind = 'main' | 'sub' | 'extra';
export interface Tag {
  id: string;
  label: string;
  kind: TagKind;
  /** For sub tags: the main tag (pillar) it belongs to. */
  main?: string;
}

/** Tag lookup over content/tags.yaml (main / sub / extra tags). */
export function tagIndex() {
  const t = load('tags.yaml');
  const all: Tag[] = [
    ...t.main.map((x) => ({ ...x, kind: 'main' as const })),
    ...t.sub.map((x) => ({ ...x, kind: 'sub' as const })),
    ...t.extra.map((x) => ({ ...x, kind: 'extra' as const })),
  ];
  const byId = new Map<string, Tag>();
  for (const x of all) {
    if (byId.has(x.id)) throw new Error(`[content] content/tags.yaml: tag "${x.id}" is listed twice`);
    byId.set(x.id, x);
  }
  for (const x of t.sub)
    if (byId.get(x.main)?.kind !== 'main')
      throw new Error(`[content] content/tags.yaml: sub tag "${x.id}" has main: ${x.main}, which is not a main tag`);

  const KIND_ORDER: Record<TagKind, number> = { main: 0, sub: 1, extra: 2 };
  return {
    all,
    get: (id: string) => byId.get(id),
    label: (id: string) => byId.get(id)?.label ?? id,
    kind: (id: string) => byId.get(id)?.kind,
    /** Sort ids main → sub → extra, keeping registry order within a kind. */
    sort: (ids: string[]) =>
      [...ids].sort(
        (a, b) =>
          KIND_ORDER[byId.get(a)!.kind] - KIND_ORDER[byId.get(b)!.kind] ||
          all.indexOf(byId.get(a)!) - all.indexOf(byId.get(b)!),
      ),
    /** Throws if any id is not in content/tags.yaml. */
    check(ids: string[] | undefined, where: string) {
      const unknown = (ids ?? []).filter((id) => !byId.has(id));
      if (unknown.length)
        throw new Error(
          `[content] ${where} uses tag(s) not listed in content/tags.yaml: ${unknown.join(', ')}. ` +
            'Add them to tags.yaml or fix the spelling.',
        );
    },
    /** Problems with a publication's tags: unknown ids, not exactly one main tag, or no sub tag. */
    publicationProblems(ids: string[]): string[] {
      const problems: string[] = [];
      const unknown = ids.filter((id) => !byId.has(id));
      if (unknown.length) problems.push(`unknown tag(s) ${unknown.join(', ')} (not in content/tags.yaml)`);
      const mains = ids.filter((id) => byId.get(id)?.kind === 'main');
      if (mains.length !== 1)
        problems.push(
          `needs exactly one main tag (${t.main.map((m) => m.id).join(' / ')}), has ${mains.length ? mains.join(', ') : 'none'}`,
        );
      if (!ids.some((id) => byId.get(id)?.kind === 'sub')) problems.push('needs at least one sub tag');
      return problems;
    },
  };
}
