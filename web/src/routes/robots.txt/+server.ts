import { resolvePublicSiteUrl } from '$lib/docs/utils/resolve-public-site-url';

export async function GET({ url }: { url: URL }) {
	const siteUrl = resolvePublicSiteUrl(url);

	const sitemapURL = new URL('/sitemap.xml', siteUrl).toString();

	const robotsTxt = [
		'User-agent: *',
		'Disallow:',
		`Sitemap: ${sitemapURL}`,
		'',
		'# Documentation (LLM overview): /llms.txt',
		'# Full documentation text: /llms-full.txt',
		'# Documentation RSS: /rss.xml'
	].join('\n');

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
