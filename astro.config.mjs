// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Draft blog posts are built (reachable by direct link) but never listed or
// put in the sitemap. The sitemap filter only sees URLs, so collect draft
// slugs from the front matter up front.
const blogDir = resolve('content/blog');
const draftSlugs = readdirSync(blogDir)
  .filter((f) => /\.mdx?$/.test(f))
  .filter((f) => /^draft:\s*true\b/m.test(readFileSync(resolve(blogDir, f), 'utf-8').split('---')[1] ?? ''))
  .map((f) => f.replace(/\.mdx?$/, ''));

/** papers.bib and the YAML files are read with fs, outside Vite's module graph,
 *  so reload the browser when they change during `astro dev`. */
const reloadOnContentChange = {
  name: 'reload-on-content-change',
  hooks: {
    /** @param {{ server: import('vite').ViteDevServer }} opts */
    'astro:server:setup': ({ server }) => {
      server.watcher.add(resolve('content'));
      server.watcher.on('change', (file) => {
        if (/content\/.*\.(ya?ml|bib)$/.test(file)) server.ws.send({ type: 'full-reload' });
      });
    },
  },
};

export default defineConfig({
  site: 'https://hyscale-lab.github.io',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    reloadOnContentChange,
    sitemap({
      filter: (page) => !draftSlugs.some((s) => page.endsWith(`/blog/${s}/`)),
    }),
  ],
  markdown: {
    // remark/rehype pipeline so math ($…$, $$…$$) is rendered by KaTeX at build time.
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
    shikiConfig: { themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' } },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
