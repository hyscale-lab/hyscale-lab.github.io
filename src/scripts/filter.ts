// Client-side filtering shared by the publications and blog pages.
//
// Markup contract (inside one [data-filter-root]):
//   items     [data-item] with data-tags="a b", data-year, data-authors="id id", data-search="lowercase text"
//   groups    [data-group] wrappers (e.g. one per year); hidden when all their items are hidden
//   controls  button[data-filter-tag="id"], select[data-filter-year], select[data-filter-author],
//             input[data-filter-q], [data-filter-clear]
//   output    [data-filter-count], [data-filter-empty]
//
// State lives in the URL (?tag=a&tag=b&year=2024&author=id&q=text) so filtered views can be shared.
// Selected tags must ALL be present on an item.

type State = { tags: Set<string>; year: string; author: string; q: string };

function readState(): State {
  const u = new URL(location.href).searchParams;
  return {
    tags: new Set(
      u
        .getAll('tag')
        .flatMap((t) => t.split(','))
        .filter(Boolean),
    ),
    year: u.get('year') ?? '',
    author: u.get('author') ?? '',
    q: u.get('q') ?? '',
  };
}

function writeState(s: State) {
  const u = new URL(location.href);
  for (const k of ['tag', 'year', 'author', 'q']) u.searchParams.delete(k);
  s.tags.forEach((t) => u.searchParams.append('tag', t));
  if (s.year) u.searchParams.set('year', s.year);
  if (s.author) u.searchParams.set('author', s.author);
  if (s.q) u.searchParams.set('q', s.q);
  history.replaceState(history.state, '', u.pathname + u.search + u.hash);
}

export function setupFilter(root: HTMLElement) {
  const state = readState();
  const items = [...root.querySelectorAll<HTMLElement>('[data-item]')];
  const groups = [...root.querySelectorAll<HTMLElement>('[data-group]')];
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter-tag]')];
  const year = root.querySelector<HTMLSelectElement>('[data-filter-year]');
  const author = root.querySelector<HTMLSelectElement>('[data-filter-author]');
  const q = root.querySelector<HTMLInputElement>('[data-filter-q]');
  const count = root.querySelector<HTMLElement>('[data-filter-count]');
  const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
  const clear = root.querySelectorAll<HTMLElement>('[data-filter-clear]');

  // Drop URL values that match no control (e.g. a stale ?author=).
  if (author && state.author && ![...author.options].some((o) => o.value === state.author)) state.author = '';
  if (year && state.year && ![...year.options].some((o) => o.value === state.year)) state.year = '';

  const apply = (push = true) => {
    const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const el of items) {
      const tags = (el.dataset.tags ?? '').split(' ');
      const ok =
        [...state.tags].every((t) => tags.includes(t)) &&
        (!state.year || el.dataset.year === state.year) &&
        (!state.author || (el.dataset.authors ?? '').split(' ').includes(state.author)) &&
        words.every((w) => (el.dataset.search ?? '').includes(w));
      el.hidden = !ok;
      if (ok) shown++;
    }
    for (const g of groups) g.hidden = !g.querySelector('[data-item]:not([hidden])');
    for (const c of chips) c.setAttribute('aria-pressed', String(state.tags.has(c.dataset.filterTag!)));
    if (year) year.value = state.year;
    if (author) author.value = state.author;
    if (q && q.value !== state.q) q.value = state.q;
    const active = state.tags.size + +!!state.year + +!!state.author + +!!state.q;
    if (count) count.textContent = active ? `${shown} of ${items.length}` : `${items.length}`;
    if (empty) empty.hidden = shown > 0;
    clear.forEach((c) => (c.hidden = !active));
    // Highlight the filtered author's name in each entry.
    root
      .querySelectorAll<HTMLElement>('[data-author-link]')
      .forEach((a) => a.classList.toggle('bg-highlight', !!state.author && a.dataset.authorLink === state.author));
    if (push) writeState(state);
  };

  chips.forEach((c) =>
    c.addEventListener('click', () => {
      const t = c.dataset.filterTag!;
      state.tags.has(t) ? state.tags.delete(t) : state.tags.add(t);
      apply();
    }),
  );
  year?.addEventListener('change', () => ((state.year = year.value), apply()));
  author?.addEventListener('change', () => ((state.author = author.value), apply()));
  let t: number | undefined;
  q?.addEventListener('input', () => {
    clearTimeout(t);
    t = window.setTimeout(() => ((state.q = q.value.trim()), apply()), 120);
  });
  clear.forEach((c) =>
    c.addEventListener('click', () => {
      state.tags.clear();
      state.year = state.author = state.q = '';
      apply();
    }),
  );
  // In-page tag and author links filter instead of navigating.
  root.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-tag-link], a[data-author-link]');
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (a.dataset.tagLink) state.tags.add(a.dataset.tagLink);
    if (a.dataset.authorLink) state.author = a.dataset.authorLink;
    apply();
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  apply(false);
}
