// Markdown collections. YAML data and papers.bib are loaded in src/lib/ instead.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Research pillars: content/research/<id>.md → /research/<id>/
const pillars = defineCollection({
  loader: glob({ base: './content/research', pattern: '*.md' }),
  schema: z
    .object({
      title: z.string(),
      summary: z.string(),
      icon: z.enum(['bolt', 'sparkles', 'eye']),
      order: z.number(),
      tag: z.string(),
      bucket: z.string(),
    })
    .strict(),
});

// Open-source projects: content/projects/<id>.md → /research/<pillar>/<id>/
const projects = defineCollection({
  loader: glob({ base: './content/projects', pattern: '*.md' }),
  schema: z
    .object({
      title: z.string(),
      tagline: z.string(),
      highlight: z.string().optional(), // landing page slide headline (defaults to the title)
      summary: z.string().optional(), // landing page slide text (defaults to the tagline)
      pillar: z.string(),
      order: z.number().default(99),
      repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'use owner/name'),
      website: z.url().optional(),
      docs: z.url().optional(),
      license: z.string().optional(),
      logo: z.string().optional(), // file in content/projects/
      image: z.string().optional(), // architecture figure, file in content/projects/
      imageAlt: z.string().optional(),
      maintainers: z.array(z.string()).default([]),
      papers: z.array(z.string()).default([]),
    })
    .strict(),
});

const blog = defineCollection({
  loader: glob({ base: './content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z
    .object({
      title: z.string(),
      description: z.string().trim().min(1),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).max(4).default([]),
      authors: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    })
    .strict(),
});

const pages = defineCollection({
  loader: glob({ base: './content/pages', pattern: '**/*.md' }),
  schema: z.object({ title: z.string(), description: z.string(), eyebrow: z.string().optional() }).strict(),
});

export const collections = { pillars, projects, blog, pages };
