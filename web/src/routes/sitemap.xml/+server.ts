import { mergeDocsUrlsIntoUrlset } from '$lib/docs/utils/merge-docs-sitemap';
import { resolvePublicSiteUrl } from '$lib/docs/utils/resolve-public-site-url';
import { normalizeApiBaseUrl } from '$lib/utils/path';

export async function GET({
	url,
	fetch: serverFetch
}: {
	url: URL;
	fetch?: typeof fetch;
}) {
	const siteUrl = resolvePublicSiteUrl(url);

	try {
		const backendUrl = normalizeApiBaseUrl(process.env.VITE_API_BASE_URL || 'http://localhost:3000');
		const backendSitemapUrl = `${backendUrl}/sitemap.xml`;

		const fetchFn = serverFetch || fetch;

		const response = await fetchFn(backendSitemapUrl, {
			cache: 'no-store',
			headers: {
				Accept: 'application/xml, text/xml, */*',
				'User-Agent': 'SvelteKit-Sitemap/1.0'
			}
		});

		if (!response.ok) {
			const errorText = await response.text().catch(() => 'Could not read error response');
			console.error(`[Sitemap] Backend returned ${response.status}:`, errorText);
			throw new Error(`Backend sitemap returned ${response.status}: ${response.statusText}`);
		}

		const sitemap = mergeDocsUrlsIntoUrlset(await response.text(), siteUrl);

		return new Response(sitemap, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (error) {
		console.error('[Sitemap] Error fetching sitemap from backend:', error);

		const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${siteUrl}/</loc>
        <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;

		const merged = mergeDocsUrlsIntoUrlset(fallbackSitemap, siteUrl);

		return new Response(merged, {
			status: 200,
			headers: {
				'Content-Type': 'application/xml'
			}
		});
	}
}
