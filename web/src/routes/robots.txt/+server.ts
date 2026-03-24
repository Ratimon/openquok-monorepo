export async function GET({ url }: { url: URL }) {
	const siteUrl =
		process.env.VITE_PUBLIC_SITE_URL || process.env.SITE_URL || `${url.protocol}//${url.host}`;

	const sitemapURL = new URL('/sitemap.xml', siteUrl).toString();

	const robotsTxt = ['User-agent: *', 'Disallow:', `Sitemap: ${sitemapURL}`].join('\n');

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
