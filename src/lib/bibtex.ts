// Dependency-free BibTeX parser for the al-folio flavour used in content/papers.bib.
// Handles @string macros, nested braces, {} / "" / bare values, # concatenation,
// "Family, Given" and "Given Family" author forms and month names, and keeps the
// raw entry text for the "Bib" button.
//
// Adapted from src/lib/papers.ts in https://github.com/alansynn/alansynn.github.io
//
// MIT License
//
// Copyright (c) 2026 Alan Synn
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export interface BibAuthor {
  given: string;
  family: string;
}

export interface BibEntry {
  key: string;
  type: string; // inproceedings | article | misc | ...
  fields: Record<string, string>;
  raw: string; // original entry text
  authors: BibAuthor[];
}

export class BibtexError extends Error {}

function findClose(src: string, open: number): number {
  const openCh = src[open];
  const closeCh = openCh === '{' ? '}' : ')';
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === openCh) depth++;
    else if (c === closeCh) {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new BibtexError(`unbalanced "${openCh}" starting at offset ${open}`);
}

/** Drop % line comments that occur outside a value. */
function stripComments(src: string): string {
  let out = '';
  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') depth = Math.max(0, depth - 1);
    if (c === '%' && depth === 0 && src[i - 1] !== '\\') {
      while (i < src.length && src[i] !== '\n') i++;
    } else {
      out += c;
    }
  }
  return out;
}

function parseValue(token: string, strings: Record<string, string>): string {
  const t = token.trim();
  if (!t) return '';
  if ((t[0] === '{' && t.at(-1) === '}') || (t[0] === '"' && t.at(-1) === '"')) return t.slice(1, -1).trim();
  if (Object.prototype.hasOwnProperty.call(strings, t.toLowerCase())) return strings[t.toLowerCase()];
  if (t.includes('#'))
    return t
      .split('#')
      .map((p) => parseValue(p, strings))
      .join('');
  return t;
}

function parseBody(body: string, strings: Record<string, string>) {
  const keyMatch = body.match(/^\s*([^,\s]+)\s*,/);
  if (!keyMatch) throw new BibtexError(`entry without a cite key: ${body.slice(0, 60)}…`);
  const key = keyMatch[1];
  let rest = body.slice(keyMatch[0].length);

  const fields: Record<string, string> = {};
  while (rest.trim().length) {
    const eq = rest.indexOf('=');
    if (eq === -1) break;
    const name = rest.slice(0, eq).trim().toLowerCase();
    if (!/^[a-z_][\w-]*$/.test(name)) throw new BibtexError(`${key}: cannot parse field name "${name}"`);
    let i = eq + 1;
    let val = '';
    let depth = 0;
    let inStr = false;
    for (; i < rest.length; i++) {
      const c = rest[i];
      if (inStr) {
        if (c === '"' && depth === 0) inStr = false;
      } else if (c === '"' && depth === 0) inStr = true;
      else if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === ',' && depth === 0) break;
      val += c;
    }
    if (name in fields) throw new BibtexError(`${key}: field "${name}" appears twice`);
    fields[name] = parseValue(val, strings);
    rest = rest.slice(i + 1);
  }
  return { key, fields };
}

/** Strip BibTeX braces and the common LaTeX escapes for display. */
export function cleanTex(s: string): string {
  return s
    .replace(/\\&/g, '&')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    .replace(/~/g, ' ')
    .replace(/--/g, '–')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitAuthors(raw: string): BibAuthor[] {
  return raw
    .split(/\s+and\s+/i)
    .map((a) => cleanTex(a))
    .filter(Boolean)
    .map((seg) => {
      if (seg.includes(',')) {
        const [family, given = ''] = seg.split(',').map((s) => s.trim());
        return { family, given };
      }
      const parts = seg.split(/\s+/);
      return parts.length > 1
        ? { family: parts.at(-1)!, given: parts.slice(0, -1).join(' ') }
        : { family: seg, given: '' };
    });
}

export function parseBibtex(src: string): BibEntry[] {
  const clean = stripComments(src);
  const strings: Record<string, string> = {};
  const entries: BibEntry[] = [];

  let i = 0;
  while (i < clean.length) {
    const at = clean.indexOf('@', i);
    if (at === -1) break;
    let j = at + 1;
    while (j < clean.length && /[A-Za-z]/.test(clean[j])) j++;
    const type = clean.slice(at + 1, j).toLowerCase();
    while (j < clean.length && /\s/.test(clean[j])) j++;
    if (clean[j] !== '{' && clean[j] !== '(') {
      i = j;
      continue;
    }
    const close = findClose(clean, j);
    const body = clean.slice(j + 1, close);
    const raw = clean.slice(at, close + 1);
    i = close + 1;

    if (type === 'string') {
      const m = body.match(/^\s*([\w-]+)\s*=\s*([\s\S]+)$/);
      if (m) strings[m[1].toLowerCase()] = parseValue(m[2], strings);
    } else if (type !== 'comment' && type !== 'preamble') {
      const { key, fields } = parseBody(body, strings);
      entries.push({ key, type, fields, raw, authors: fields.author ? splitAuthors(fields.author) : [] });
    }
  }
  return entries;
}
