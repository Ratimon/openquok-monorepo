import { resolvePublicSiteUrl } from '$lib/docs/utils/resolve-public-site-url';

export async function GET({ url }: { url: URL }) {
	const siteUrl = resolvePublicSiteUrl(url);

	const sitemapURL = new URL('/sitemap.xml', siteUrl).toString();

	const robotsTxt = [
		'User-agent: *',
		'Disallow: /sign-in',
		'Disallow: /sign-up',
		'Disallow: /forgot-password',
		'Disallow: /update-password',
		'Disallow: /verify-signup',
		'Disallow: /confirm-change-password',
		'Disallow: /auth-error',
		'Disallow: /account',
		'Disallow: /editor',
		'Disallow: /admin',
		'Disallow: /secret-admin',
		'Disallow: /oauth',
		'Disallow: /integration/oauth',
		`Sitemap: ${sitemapURL}`,
		'',
		'# --- Meta web crawlers (public URL checks, link previews, developer app settings) ---',
		'# https://developers.facebook.com/docs/sharing/webmasters/web-crawlers',
		'# Explicit Allow so privacy policy, OAuth, and other app URLs stay reachable if rules evolve.',
		'User-agent: facebookexternalhit',
		'Allow: /',
		'',
		'User-agent: meta-webindexer',
		'Allow: /',
		'',
		'User-agent: meta-externalads',
		'Allow: /',
		'',
		'User-agent: meta-externalagent',
		'Allow: /',
		'',
		'User-agent: meta-externalfetcher',
		'Allow: /',
		'',
		'# Documentation (LLM overview): /llms.txt',
		'# Full documentation text: /llms-full.txt',
		'# Documentation RSS: /rss.xml'
	].join('\n');

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
