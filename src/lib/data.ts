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
  'tags.yaml': z.array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), label: z.string() }).strict()),
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

/** Tag lookup; throws on ids that are not in content/tags.yaml. */
export function tagIndex() {
  const tags = load('tags.yaml');
  const byId = new Map(tags.map((t) => [t.id, t]));
  return {
    all: tags,
    label: (id: string) => byId.get(id)?.label ?? id,
    check(ids: string[] | undefined, where: string) {
      const unknown = (ids ?? []).filter((t) => !byId.has(t));
      if (unknown.length)
        throw new Error(
          `[content] ${where} uses tag(s) not listed in content/tags.yaml: ${unknown.join(', ')}. ` +
            'Add them to tags.yaml or fix the spelling.',
        );
    },
  };
}
