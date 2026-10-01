import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/blog';
import { site } from '../lib/data';

export async function GET(context: APIContext) {
  const s = site();
  const posts = await getPosts();
  return rss({
    title: `${s.name} blog`,
    description: s.description,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/blog/${p.id}/`,
      categories: p.data.tags,
    })),
  });
}
