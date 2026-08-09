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
 * Explicit Allow keeps public marketing/docs reachable once CDN-managed robots.txt is disabled.
 *
 * Directory “AI engine coverage” tools commonly treat ClaudeBot / Google-Extended
 * site-wide Disallow as “Claude / Gemini hasn’t found you.”
 */
export const ROBOTS_AI_CRAWLER_USER_AGENTS = [
	'GPTBot',
	'ChatGPT-User',
	'OAI-SearchBot',
	'ClaudeBot',
	'Claude-SearchBot',
	'Claude-User',
	'anthropic-ai',
	'Google-Extended',
	'PerplexityBot',
	'Perplexity-User',
	'Applebot-Extended'
] as const;

/** Prefer search / grounding; discourage training when Content Signals are honored. */
export const ROBOTS_CONTENT_SIGNAL =
	'Content-Signal: search=yes,ai-input=yes,ai-train=no,use=reference';

export function robotsDisallowLines(prefix: 'Disallow' | 'Allow' = 'Disallow'): string[] {
	return ROBOTS_DISALLOWED_PATHS.map((path) => `${prefix}: ${path}`);
}

export function robotsAiCrawlerBlocks(): string[] {
	const lines: string[] = [
		'# --- AI crawlers (search, grounding, and assistant link previews) ---',
		'# Public pages, docs (/docs/*), and /llms.txt stay reachable; app/auth paths stay blocked.',
		'# Production: turn OFF Cloudflare "block training in robots.txt" (managed robots.txt).',
		'# That feature prepends Disallow: / for ClaudeBot / Google-Extended and overrides these Allows.',
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
