import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { tagIndex } from './data';
import { getPerson } from './people';

export type Post = CollectionEntry<'blog'>;

/** Published posts, newest first. Validates tags and author ids. */
export async function getPosts({ drafts = false } = {}) {
  const tags = tagIndex();
  const posts = await getCollection('blog', (p) => drafts || !p.data.draft);
  for (const p of posts) {
    tags.check(p.data.tags, `content/blog/${p.id}`);
    for (const a of p.data.authors)
      if (!getPerson(a))
        throw new Error(`[content] content/blog/${p.id}: author "${a}" is not an id in content/people.yaml`);
  }
  return posts.sort((a, b) => +b.data.date - +a.data.date);
}

export const readingTime = (body = '') => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220));

export const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
