// Build-time GitHub repository stats (stars) for project pages and the landing
// page. Fails soft: if the API is unreachable or rate-limited, stats are hidden.
const cache = new Map<string, Promise<number | null>>();

export function repoStars(repo: string): Promise<number | null> {
  if (!cache.has(repo))
    cache.set(
      repo,
      (async () => {
        try {
          const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
          if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
          const res = await fetch(`https://api.github.com/repos/${repo}`, {
            headers,
            signal: AbortSignal.timeout(5000),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return ((await res.json()) as { stargazers_count: number }).stargazers_count;
        } catch (e) {
          console.warn(`[github] stars for ${repo} unavailable, hiding them (${(e as Error).message})`);
          return null;
        }
      })(),
    );
  return cache.get(repo)!;
}

/** Sum of stars, or null if any repo is unavailable. */
export async function totalStars(repos: string[]): Promise<number | null> {
  const counts = await Promise.all(repos.map(repoStars));
  return counts.some((c) => c === null) ? null : counts.reduce((a, b) => a! + b!, 0);
}
