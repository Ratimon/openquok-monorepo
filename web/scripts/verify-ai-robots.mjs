#!/usr/bin/env node
/**
 * Fail if production robots.txt still has Cloudflare-managed site-wide Disallow
 * for ClaudeBot / Google-Extended (the usual PeerPush “Claude / Gemini hasn’t found you” cause).
 *
 * Usage:
 *   node ./scripts/verify-ai-robots.mjs
 *   node ./scripts/verify-ai-robots.mjs https://www.openquok.com/robots.txt
 */

const url = process.argv[2] ?? 'https://www.openquok.com/robots.txt';

const BLOCKED_AGENTS = ['ClaudeBot', 'Google-Extended'];

const res = await fetch(url, {
	headers: { Accept: 'text/plain' },
	redirect: 'follow'
});

if (!res.ok) {
	console.error(`Failed to fetch ${url}: HTTP ${res.status}`);
	process.exit(1);
}

const body = await res.text();
const hasManaged = /#\s*BEGIN Cloudflare Managed content/i.test(body);

/** @param {string} agent */
function managedDisallowsAgent(agent) {
	if (!hasManaged) return false;
	const managed = body.match(
		/#\s*BEGIN Cloudflare Managed content([\s\S]*?)#\s*END Cloudflare Managed Content/i
	);
	if (!managed) return false;
	const section = managed[1];
	const escaped = agent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const re = new RegExp(`User-agent:\\s*${escaped}\\s*\\nDisallow:\\s*/`, 'i');
	return re.test(section);
}

const blocked = BLOCKED_AGENTS.filter(managedDisallowsAgent);

if (blocked.length === 0) {
	console.log(`OK: ${url}`);
	if (hasManaged) {
		console.log(
			'Cloudflare managed robots.txt is present, but ClaudeBot / Google-Extended are not Disallow: / in that block.'
		);
	} else {
		console.log('No Cloudflare managed robots.txt prepend detected.');
	}
	process.exit(0);
}

console.error(`FAIL: ${url}`);
console.error(
	`Cloudflare managed robots.txt still has site-wide Disallow for: ${blocked.join(', ')}`
);
console.error('');
console.error('This is the PeerPush “Claude / Gemini hasn’t found you” cause.');
console.error('Repo Allow rules cannot override the Cloudflare prepend.');
console.error('');
console.error('Fix (pick one):');
console.error('  A) Cloudflare dashboard → zone for www.openquok.com');
console.error('     Security → Settings → Bot traffic');
console.error('     Turn OFF “Set your preference to block training in robots.txt”');
console.error('  B) API (Bot Management Write token):');
console.error('     CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ZONE_NAME=openquok.com pnpm --filter ./web run fix:ai-robots');
console.error('');
console.error(
	'Allowing crawlers in AI Crawl Control alone does not remove this prepended Disallow block.'
);
console.error('Docs: /docs/configuration-web/ai-crawlers-and-robots');
process.exit(1);
