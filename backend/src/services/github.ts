function parseGitHubUsername(urlOrHandle: string): string | null {
  const raw = urlOrHandle.trim();
  if (!raw) return null;
  if (!raw.includes('/') && !raw.includes('.')) {
    return raw.replace(/^@/, '');
  }
  try {
    const withProto = raw.startsWith('http') ? raw : `https://${raw}`;
    const u = new URL(withProto);
    if (!u.hostname.includes('github.com')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'orgs' && parts[1]) return null;
    return parts[0] ?? null;
  } catch {
    return null;
  }
}

export async function fetchGitHubProfileSummary(
  github: string,
): Promise<string | undefined> {
  const username = parseGitHubUsername(github);
  if (!username) return undefined;

  try {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'OpportunityAgent-Hackathon',
    };

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=12`,
        { headers },
      ),
    ]);

    if (!userRes.ok) {
      return `GitHub user "${username}" could not be loaded (HTTP ${userRes.status}).`;
    }

    const user = (await userRes.json()) as {
      name?: string;
      bio?: string;
      public_repos?: number;
      followers?: number;
      location?: string;
      company?: string;
      blog?: string;
    };

    let repoLines = '';
    if (reposRes.ok) {
      const repos = (await reposRes.json()) as Array<{
        name: string;
        description?: string | null;
        language?: string | null;
        stargazers_count?: number;
        fork?: boolean;
      }>;
      repoLines = repos
        .filter((r) => !r.fork)
        .slice(0, 8)
        .map(
          (r) =>
            `- ${r.name}${r.language ? ` (${r.language})` : ''}${r.description ? `: ${r.description}` : ''}${r.stargazers_count ? ` ★${r.stargazers_count}` : ''}`,
        )
        .join('\n');
    }

    return [
      `GitHub @${username}`,
      user.name ? `Name on GitHub: ${user.name}` : '',
      user.bio ? `Bio: ${user.bio}` : '',
      user.location ? `Location: ${user.location}` : '',
      user.company ? `Company: ${user.company}` : '',
      `Public repos: ${user.public_repos ?? '?'}`,
      repoLines ? `Recent repositories:\n${repoLines}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  } catch (err) {
    console.warn('[github] fetch failed:', err);
    return `GitHub profile ${username} (fetch failed — use URL context only).`;
  }
}
