// People model: one entry per person with a list of stints (content/people.yaml).
// Which tab someone appears on is computed here, so graduating a member is a
// one-line `end:` edit.

import { load, type Content, type Role } from './data';

export type Person = Content<'people.yaml'>[number];
export type Stint = Person['stints'][number];

/** Display order and labels for role groups. */
export const ROLE_GROUPS: { role: Role; label: string; singular: string }[] = [
  { role: 'pi', label: 'Principal investigator', singular: 'Principal investigator' },
  { role: 'postdoc', label: 'Postdoctoral researchers', singular: 'Postdoctoral researcher' },
  { role: 'phd', label: 'PhD students', singular: 'PhD student' },
  { role: 'exchange-phd', label: 'Exchange PhD students', singular: 'Exchange PhD student' },
  { role: 'ra', label: 'Research assistants', singular: 'Research assistant' },
  { role: 'intern', label: 'Interns', singular: 'Intern' },
  { role: 'fyp', label: 'Final-year project students', singular: 'Final-year project student' },
  { role: 'ureca', label: 'URECA undergraduate researchers', singular: 'Undergraduate researcher (URECA)' },
];

const SUPERVISEE_ROLES: Role[] = ['fyp', 'ureca'];
export const roleLabel = (r: Role) => ROLE_GROUPS.find((g) => g.role === r)!.singular;

/** A stint is ongoing if it has no end, or ends this year or later. */
export const isOngoing = (s: Stint, now = new Date().getFullYear()) => s.end === undefined || s.end >= now;

export const period = (s: { start: number; end?: number }) =>
  s.end === undefined ? `${s.start}–present` : s.start === s.end ? `${s.start}` : `${s.start}–${s.end}`;

const memberStints = (p: Person) => p.stints.filter((s) => !SUPERVISEE_ROLES.includes(s.role));

export function getPeople() {
  const people = load('people.yaml');
  const seen = new Set<string>();
  for (const p of people) {
    if (seen.has(p.id)) throw new Error(`[content] content/people.yaml: duplicate id "${p.id}"`);
    seen.add(p.id);
  }
  return people;
}

export function getPerson(id: string) {
  return getPeople().find((p) => p.id === id);
}

/** Current lab members grouped by their current role (PI excluded). */
export function currentGroups() {
  const current = getPeople()
    .map((p) => ({
      person: p,
      stint: memberStints(p)
        .filter((s) => isOngoing(s))
        .at(-1),
    }))
    .filter((x): x is { person: Person; stint: Stint } => !!x.stint);
  return ROLE_GROUPS.filter((g) => !SUPERVISEE_ROLES.includes(g.role) && g.role !== 'pi')
    .map((g) => ({
      ...g,
      members: current
        .filter((x) => x.stint.role === g.role)
        .sort((a, b) => a.stint.start - b.stint.start || a.person.name.localeCompare(b.person.name)),
    }))
    .filter((g) => g.members.length);
}

export function pi() {
  const p = getPeople().find((x) => x.stints.some((s) => s.role === 'pi'));
  if (!p) throw new Error('[content] content/people.yaml: no person with a `pi` stint');
  return p;
}

/** Former members: had a member stint, and none is ongoing. Most recent first. */
export function alumni() {
  return getPeople()
    .map((p) => ({ person: p, stints: memberStints(p) }))
    .filter((x) => x.stints.length && !x.stints.some((s) => isOngoing(s)))
    .map((x) => ({ person: x.person, last: x.stints.at(-1)! }))
    .sort((a, b) => b.last.end! - a.last.end! || a.person.name.localeCompare(b.person.name));
}

/** FYP / URECA students grouped by academic year (e.g. "2024–2025"), newest first. */
export function supervisees() {
  const rows = getPeople().flatMap((p) =>
    p.stints.filter((s) => SUPERVISEE_ROLES.includes(s.role)).map((s) => ({ person: p, stint: s })),
  );
  const years = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = period(r.stint);
    years.set(key, [...(years.get(key) ?? []), r]);
  }
  return [...years.entries()]
    .sort(([, a], [, b]) => (b[0].stint.end ?? 9999) - (a[0].stint.end ?? 9999) || b[0].stint.start - a[0].stint.start)
    .map(([label, rs]) => ({ label, rows: rs.sort((a, b) => a.person.name.localeCompare(b.person.name)) }));
}

const norm = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

/** Map a BibTeX author ("Given Family") to a lab member, by full name or bib_names. */
export function memberMatcher() {
  const index = new Map<string, Person>();
  for (const p of getPeople()) {
    for (const n of [p.name, ...(p.bib_names ?? [])]) index.set(norm(n), p);
  }
  return (given: string, family: string) =>
    index.get(norm(`${given} ${family}`)) ?? index.get(norm(`${family} ${given}`));
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
