// Publications model built from content/papers.bib, content/venues.yaml,
// content/citations.yml and content/people.yaml.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseBibtex, cleanTex, BibtexError } from './bibtex';
import { load, tagIndex } from './data';
import { memberMatcher, type Person } from './people';

export interface PaperAuthor {
  name: string;
  member?: Pick<Person, 'id' | 'name' | 'links'>;
}

export interface PaperLink {
  label: string;
  href: string;
}

export interface Paper {
  key: string;
  year: number;
  month: number | null;
  title: string;
  authors: PaperAuthor[];
  venue: string;
  abbr: string | null;
  venueColor: string;
  venueUrl: string | null;
  links: PaperLink[];
  preview: string | null; // file name in content/papers/previews/
  award: string | null;
  note: string | null; // additional_info
  abstract: string | null;
  selected: boolean;
  tags: string[];
  bucket: string | null;
  pillar: string | null;
  citations: number | null;
  bibtex: string;
}

const BIB_PATH = resolve(process.cwd(), 'content/papers.bib');
const PREVIEW_DIR = resolve(process.cwd(), 'content/papers/previews');
const PDF_DIR = resolve(process.cwd(), 'public/assets/pdf');
const DEFAULT_VENUE_COLOR = '#475569';

const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

// Site-only fields that are dropped from the BibTeX shown to visitors.
const INTERNAL_FIELDS = new Set([
  'abbr',
  'abstract',
  'additional_info',
  'award',
  'bibtex_show',
  'code',
  'google_scholar_id',
  'html',
  'pdf',
  'preview',
  'research_bucket',
  'research_pillar',
  'research_status',
  'selected',
  'slides',
  'poster',
  'tags',
  'video',
  'website',
  'arxiv',
]);

const isUrl = (s: string) => /^https?:\/\//.test(s);
const list = (s: string | undefined) =>
  (s ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

function exportBibtex(type: string, key: string, fields: Record<string, string>) {
  const lines = Object.entries(fields)
    .filter(([k]) => !INTERNAL_FIELDS.has(k))
    .map(([k, v]) => `  ${k} = {${v}}`);
  return `@${type}{${key},\n${lines.join(',\n')}\n}`;
}

/** Darken a venue colour until white badge text meets WCAG AA (4.5:1). */
function badgeColor(hex: string): string {
  const rgb = hex.match(/^#([0-9a-f]{6})$/i) ? [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) : null;
  if (!rgb) return hex;
  const lum = (c: number[]) =>
    c
      .map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
  let c = rgb;
  while (1.05 / (lum(c) + 0.05) < 4.6) c = c.map((v) => Math.round(v * 0.94));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

let cache: Paper[] | null = null;

/** All papers, newest first (stable within a year by order in papers.bib). */
export function getPapers(): Paper[] {
  if (import.meta.env.PROD && cache) return cache;

  let entries;
  try {
    entries = parseBibtex(readFileSync(BIB_PATH, 'utf-8'));
  } catch (e) {
    if (e instanceof BibtexError) throw new Error(`[content] content/papers.bib: ${e.message}`);
    throw e;
  }

  const venues = load('venues.yaml');
  const citations = load('citations.yml').papers;
  const scholarId = load('site.yaml').scholar_userid;
  const tags = tagIndex();
  const matchMember = memberMatcher();
  const problems: string[] = [];
  const seen = new Set<string>();

  const papers = entries.map(({ key, type, fields: f, authors }): Paper => {
    if (seen.has(key)) problems.push(`${key}: duplicate cite key`);
    seen.add(key);
    const year = parseInt(f.year ?? '', 10);
    if (!year) problems.push(`${key}: missing or invalid year`);
    if (!f.title) problems.push(`${key}: missing title`);

    const paperTags = list(f.tags);
    try {
      tags.check(paperTags, `content/papers.bib → ${key}`);
    } catch (e) {
      problems.push((e as Error).message.replace(/^\[content\] /, ''));
    }

    const links: PaperLink[] = [];
    if (f.pdf) {
      if (!isUrl(f.pdf) && !existsSync(resolve(PDF_DIR, f.pdf)))
        problems.push(`${key}: pdf "${f.pdf}" not found in public/assets/pdf/`);
      links.push({ label: 'PDF', href: isUrl(f.pdf) ? f.pdf : `/assets/pdf/${f.pdf}` });
    }
    if (f.arxiv) links.push({ label: 'arXiv', href: `https://arxiv.org/abs/${f.arxiv}` });
    if (f.code) links.push({ label: 'Code', href: f.code });
    if (f.video) links.push({ label: 'Video', href: f.video });
    if (f.slides) links.push({ label: 'Slides', href: isUrl(f.slides) ? f.slides : `/assets/pdf/${f.slides}` });
    if (f.website ?? f.html) links.push({ label: 'Website', href: (f.website ?? f.html)! });
    if (f.doi) links.push({ label: 'DOI', href: `https://doi.org/${f.doi}` });
    else if (f.url && !links.some((l) => l.href === f.url) && !f.arxiv) links.push({ label: 'URL', href: f.url });

    if (f.preview && !existsSync(resolve(PREVIEW_DIR, f.preview)))
      problems.push(`${key}: preview "${f.preview}" not found in content/papers/previews/`);

    const abbr = f.abbr ? cleanTex(f.abbr) : null;
    const venue = abbr ? venues[abbr] : undefined;
    const sid = f.google_scholar_id;
    const cites = sid ? citations[`${scholarId}:${sid}`]?.citations : undefined;
    const monthRaw = (f.month ?? '').trim().toLowerCase().slice(0, 3);

    return {
      key,
      year,
      month: MONTHS[monthRaw] ?? (/^\d+$/.test(monthRaw) ? +monthRaw : null),
      title: cleanTex(f.title ?? ''),
      authors: authors.map(({ given, family }) => {
        const member = matchMember(given, family);
        return {
          name: [given, family].filter(Boolean).join(' '),
          member: member && { id: member.id, name: member.name, links: member.links },
        };
      }),
      venue: cleanTex(f.booktitle ?? f.journal ?? (f.archiveprefix === 'arXiv' || f.arxiv ? 'arXiv preprint' : '')),
      abbr,
      venueColor: badgeColor(venue?.color ?? DEFAULT_VENUE_COLOR),
      venueUrl: venue?.url ?? null,
      links,
      preview: f.preview ?? null,
      award: f.award ? cleanTex(f.award) : null,
      note: f.additional_info ? cleanTex(f.additional_info) : null,
      abstract: f.abstract ? cleanTex(f.abstract) : null,
      selected: (f.selected ?? '').toLowerCase() === 'true',
      tags: paperTags,
      bucket: f.research_bucket ?? null,
      pillar: f.research_pillar ?? null,
      citations: cites ?? null,
      bibtex: exportBibtex(type, key, f),
    };
  });

  if (problems.length)
    throw new Error(`[content] content/papers.bib has ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);

  papers.sort((a, b) => b.year - a.year || (b.month ?? 0) - (a.month ?? 0));
  if (import.meta.env.PROD) cache = papers;
  return papers;
}

export function papersByKeys(keys: string[]) {
  const all = getPapers();
  return keys.map((k) => {
    const p = all.find((x) => x.key === k);
    if (!p) throw new Error(`[content] unknown BibTeX key "${k}"`);
    return p;
  });
}

/** Sum over the whole Google Scholar profile (content/citations.yml), not just papers.bib. */
export const totalCitations = () => Object.values(load('citations.yml').papers).reduce((n, p) => n + p.citations, 0);
