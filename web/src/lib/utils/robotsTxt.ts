/** Paths that must stay out of search and AI crawlers (auth, app, admin). */
export const ROBOTS_DISALLOWED_PATHS = [
	'/sign-in',
	'/sign-up',
	'/forgot-password',
	'/update-password',
	'/verify-signup',
	'/confirm-change-password',
	'/auth-error',
	'/account',
	'/editor',
	'/admin',
	'/secret-admin',
	'/oauth',
	'/integration/oauth'
] as const;

/**
 * User agents used for AI search, grounding, and assistant browsing.
 * Explicit Allow keeps public marketing/docs reachable when rules are merged with CDN-managed robots.txt.
 */
export const ROBOTS_AI_CRAWLER_USER_AGENTS = [
	'GPTBot',
	'ChatGPT-User',
	'OAI-SearchBot',
	'ClaudeBot',
	'anthropic-ai',
	'Google-Extended',
	'PerplexityBot',
	'Applebot-Extended'
] as const;

export function robotsDisallowLines(prefix: 'Disallow' | 'Allow' = 'Disallow'): string[] {
	return ROBOTS_DISALLOWED_PATHS.map((path) => `${prefix}: ${path}`);
}

export function robotsAiCrawlerBlocks(): string[] {
	const lines: string[] = [
		'# --- AI crawlers (search, grounding, and assistant link previews) ---',
		'# Public pages, docs (/docs/*), and /llms.txt stay reachable; app/auth paths stay blocked.',
		'# Production: Cloudflare "Managed robots.txt" may prepend Disallow: / for these bots.',
		'# Allow them in Cloudflare AI Crawl Control (or turn off blanket AI blocks) so directives match.',
		'# See /docs/configuration-web/ai-crawlers-and-robots',
		''
	];

	for (const agent of ROBOTS_AI_CRAWLER_USER_AGENTS) {
		lines.push(`User-agent: ${agent}`);
		lines.push('Allow: /');
		lines.push(...robotsDisallowLines('Disallow'));
		lines.push('');
	}

	return lines;
}
