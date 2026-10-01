// Research pillars (content/research/) and open-source projects (content/projects/).
import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { tagIndex } from './data';
import { getPerson } from './people';

export type Pillar = CollectionEntry<'pillars'>;
export type Project = CollectionEntry<'projects'>;

export async function getPillars(): Promise<Pillar[]> {
  const pillars = (await getCollection('pillars')).sort((a, b) => a.data.order - b.data.order);
  const tags = tagIndex();
  // The file name doubles as the pillar's main tag.
  for (const p of pillars)
    if (tags.kind(p.id) !== 'main')
      throw new Error(`[content] content/research/${p.id}.md: "${p.id}" must also be a main tag in content/tags.yaml`);
  return pillars;
}

export async function getProjects(): Promise<Project[]> {
  const ids = new Set((await getCollection('pillars')).map((p) => p.id));
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
  for (const p of projects) {
    if (!ids.has(p.data.pillar))
      throw new Error(
        `[content] content/projects/${p.id}.md: pillar "${p.data.pillar}" is not a file in content/research/`,
      );
    for (const m of p.data.maintainers)
      if (!getPerson(m))
        throw new Error(`[content] content/projects/${p.id}.md: maintainer "${m}" is not an id in content/people.yaml`);
  }
  return projects;
}

export const projectUrl = (p: Project) => `/research/${p.data.pillar}/${p.id}/`;

const images = import.meta.glob<{ default: ImageMetadata }>('/content/projects/images/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
});

/** Resolve a project image path (relative to content/projects/). */
export function projectImage(project: Project, file: string | undefined) {
  if (!file) return undefined;
  const img = images[`/content/projects/${file}`]?.default;
  if (!img)
    throw new Error(`[content] content/projects/${project.id}.md: image "${file}" not found in content/projects/`);
  return img;
}
