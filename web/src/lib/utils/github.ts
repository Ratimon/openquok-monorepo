/** Parse owner/repo from a github.com repository or tree/blob URL. */
export function parseGithubRepoFromUrl(
	url: string | null | undefined
): { owner: string; name: string } | null {
	if (!url?.trim()) return null;

	try {
		const parsed = new URL(url.trim());
		const host = parsed.hostname.replace(/^www\./, '');
		if (host !== 'github.com') return null;

		const [owner, name] = parsed.pathname.split('/').filter(Boolean);
		if (!owner || !name) return null;

		return { owner, name };
	} catch {
		return null;
	}
}
