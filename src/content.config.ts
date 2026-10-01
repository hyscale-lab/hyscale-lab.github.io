// Markdown collections. YAML data and papers.bib are loaded in src/lib/ instead.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './content/projects', pattern: '**/*.md' }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      pillar: z.enum(['serverless', 'agentic', 'multimodal']),
      order: z.number().default(99),
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
  schema: z.object({ title: z.string(), description: z.string() }).strict(),
});

export const collections = { projects, blog, pages };
