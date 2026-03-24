export async function GET({
	url,
	fetch: serverFetch
}: {
	url: URL;
	fetch?: typeof fetch;
}) {
	try {
		const backendUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
		const backendSitemapUrl = `${backendUrl.replace(/\/$/, '')}/sitemap.xml`;

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

		const sitemap = await response.text();

		return new Response(sitemap, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (error) {
		console.error('[Sitemap] Error fetching sitemap from backend:', error);

		const hostname =
			process.env.VITE_PUBLIC_SITE_URL || process.env.SITE_URL || `${url.protocol}//${url.host}`;
		const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${hostname.replace(/\/$/, '')}/</loc>
        <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;

		return new Response(fallbackSitemap, {
			status: 200,
			headers: {
				'Content-Type': 'application/xml'
			}
		});
	}
}
