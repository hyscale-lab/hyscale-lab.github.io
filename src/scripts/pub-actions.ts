// Abs / Bib toggles and the BibTeX copy button on publication entries.
export function setupPubActions(root: ParentNode = document) {
  root.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach((btn) => {
    btn.onclick = () => {
      const target = document.getElementById(btn.getAttribute('aria-controls')!);
      if (!target) return;
      const open = btn.getAttribute('aria-expanded') !== 'true';
      // Only one panel per entry at a time, like al-folio.
      btn.parentElement?.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        const t = document.getElementById(b.getAttribute('aria-controls')!);
        if (t) t.hidden = true;
      });
      btn.setAttribute('aria-expanded', String(open));
      target.hidden = !open;
    };
  });
  root.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    btn.onclick = async () => {
      const label = btn.querySelector('span');
      try {
        await navigator.clipboard.writeText(btn.dataset.copy!);
        if (label) label.textContent = 'Copied';
      } catch {
        if (label) label.textContent = 'Select & copy';
      }
      setTimeout(() => label && (label.textContent = 'Copy'), 1600);
    };
  });
}
