import { eachLocaleDocPages } from '$lib/docs/content';
import { docsConfig } from '$lib/docs/constants';
import { resolvePublicSiteUrl } from '$lib/docs/utils/resolve-public-site-url';
import { escapeXml } from '$lib/docs/utils/xml-escape';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = ({ url }) => {
	const siteUrl = resolvePublicSiteUrl(url);
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	const siteTitle = docsConfig.site.title;
	const siteDescription = docsConfig.site.description;
	const blogRssUrl = `${siteUrl}/api/v1/blog-system/rss?format=rss`;
	const channelDescription = `${siteDescription} Blog posts: ${blogRssUrl}`;

	const items: string[] = [];
	for (const { locale, localeLabel, pages } of eachLocaleDocPages()) {
		for (const doc of pages) {
			const titleSuffix = locale !== defaultLocale ? ` (${localeLabel})` : '';
			const link = `${siteUrl}${doc.href.startsWith('/') ? doc.href : `/${doc.href}`}`;
			const pub =
				doc.meta.lastUpdated != null && doc.meta.lastUpdated !== ''
					? `<pubDate>${new Date(doc.meta.lastUpdated).toUTCString()}</pubDate>`
					: '';
			items.push(`    <item>
      <title>${escapeXml(doc.meta.title + titleSuffix)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <description>${escapeXml(doc.meta.description)}</description>
      ${pub}
    </item>`);
		}
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)} — Docs</title>
    <link>${escapeXml(`${siteUrl}/docs`)}</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>${defaultLocale}</language>
    <atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
