// Build-time GitHub star count for the landing page stats bar. Fails soft:
// if the API is unreachable or rate-limited the stat is simply not shown.
let cached: Promise<number | null> | null = null;

export function totalStars(repos: string[]): Promise<number | null> {
  cached ??= (async () => {
    try {
      const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
      if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      const counts = await Promise.all(
        repos.map(async (r) => {
          const res = await fetch(`https://api.github.com/repos/${r}`, { headers, signal: AbortSignal.timeout(5000) });
          if (!res.ok) throw new Error(`${r}: HTTP ${res.status}`);
          return ((await res.json()) as { stargazers_count: number }).stargazers_count;
        }),
      );
      return counts.reduce((a, b) => a + b, 0);
    } catch (e) {
      console.warn(`[github] star count unavailable, hiding the stat (${(e as Error).message})`);
      return null;
    }
  })();
  return cached;
}
