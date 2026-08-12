#!/usr/bin/env node
/**
 * Turn OFF Cloudflare managed robots.txt for a zone so ClaudeBot / Google-Extended
 * are no longer prepended with Disallow: / (PeerPush Claude / Gemini coverage gap).
 *
 * Requires a token with Zone → Bot Management → Edit (or Account equivalent).
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ZONE_ID=… node ./scripts/disable-cloudflare-managed-robots.mjs
 *   # or resolve zone id from hostname:
 *   CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ZONE_NAME=openquok.com node ./scripts/disable-cloudflare-managed-robots.mjs
 *
 * Then verify:
 *   pnpm --filter ./web run verify:ai-robots
 */

const token = process.env.CLOUDFLARE_API_TOKEN ?? process.env.CF_API_TOKEN;
const zoneIdEnv = process.env.CLOUDFLARE_ZONE_ID ?? process.env.CF_ZONE_ID;
const zoneName = process.env.CLOUDFLARE_ZONE_NAME ?? process.env.CF_ZONE_NAME ?? 'openquok.com';

if (!token) {
	console.error('Missing CLOUDFLARE_API_TOKEN (or CF_API_TOKEN).');
	console.error('Create a token with Bot Management Write for the marketing zone.');
	process.exit(1);
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
async function cf(path, init = {}) {
	const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			...(init.headers ?? {})
		}
	});
	const json = await res.json();
	if (!res.ok || json.success === false) {
		const errors = Array.isArray(json.errors)
			? json.errors.map((e) => e.message ?? JSON.stringify(e)).join('; ')
			: res.statusText;
		throw new Error(`${init.method ?? 'GET'} ${path} failed: ${errors}`);
	}
	return json;
}

async function resolveZoneId() {
	if (zoneIdEnv) return zoneIdEnv;
	const list = await cf(`/zones?name=${encodeURIComponent(zoneName)}&status=active`);
	const id = list.result?.[0]?.id;
	if (!id) {
		throw new Error(`No active zone found for name=${zoneName}. Set CLOUDFLARE_ZONE_ID.`);
	}
	return id;
}

const zoneId = await resolveZoneId();
console.log(`Zone: ${zoneId}${zoneIdEnv ? '' : ` (${zoneName})`}`);

const before = await cf(`/zones/${zoneId}/bot_management`);
const current = before.result ?? {};
const managedBefore = current.is_robots_txt_managed;
const aiBotsBefore = current.ai_bots_protection;
console.log(`Before: is_robots_txt_managed=${managedBefore}, ai_bots_protection=${aiBotsBefore}`);

if (managedBefore === false) {
	console.log('Managed robots.txt is already off. Nothing to change.');
} else {
	/** Writable fields only — drop read-only / plan metadata from GET. */
	const writableKeys = [
		'ai_bots_protection',
		'cf_robots_variant',
		'content_bots_protection',
		'crawler_protection',
		'enable_js_detections',
		'fight_mode',
		'is_robots_txt_managed',
		'optimize_wordpress',
		'sbfm_definitely_automated',
		'sbfm_likely_automated',
		'sbfm_static_resource_protection',
		'sbfm_verified_bots',
		'suppress_session_score',
		'auto_update_model',
		'bm_cookie_enabled'
	];
	/** @type {Record<string, unknown>} */
	const payload = {};
	for (const key of writableKeys) {
		if (current[key] !== undefined) payload[key] = current[key];
	}
	payload.is_robots_txt_managed = false;

	await cf(`/zones/${zoneId}/bot_management`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
	const after = await cf(`/zones/${zoneId}/bot_management`);
	console.log(
		`After: is_robots_txt_managed=${after.result?.is_robots_txt_managed}, ai_bots_protection=${after.result?.ai_bots_protection}`
	);
}

console.log('');
console.log('Next:');
console.log('  1. Optional: Security → AI Crawl Control → Allow ClaudeBot + Google-Extended');
console.log('  2. pnpm --filter ./web run verify:ai-robots');
console.log('  3. curl -sS https://www.openquok.com/robots.txt | head -n 80');
console.log('');
console.log(
	'Note: Origin Content-Signal still sets ai-train=no while Allowing search/grounding crawlers.'
);
