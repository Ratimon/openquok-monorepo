/** Chrome tab query patterns — `*.reddit.com` does not match apex `reddit.com`. */
export const REDDIT_TAB_QUERY_URL_PATTERNS = ['*://*.reddit.com/*', '*://reddit.com/*'] as const;

export function isRedditHostname(hostname: string): boolean {
	const host = hostname.toLowerCase();
	return host === 'reddit.com' || host.endsWith('.reddit.com');
}

export function isRedditSubmitTabUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		if (!isRedditHostname(parsed.hostname)) return false;
		return parsed.pathname.includes('/submit');
	} catch {
		return false;
	}
}
