import { eachLocaleDocPages } from '$lib/docs/content';
import { escapeXml } from './xml-escape';

function extractLocs(xml: string): Set<string> {
	const set = new Set<string>();
	for (const m of xml.matchAll(/<loc>([^<]*)<\/loc>/g)) {
		set.add(m[1]!.trim());
	}
	return set;
}

/** Append documentation URLs before `</urlset>`; skips locs already present. */
export function mergeDocsUrlsIntoUrlset(backendXml: string, siteOrigin: string): string {
	const trimmedOrigin = siteOrigin.replace(/\/$/, '');
	const existing = extractLocs(backendXml);
	const today = new Date().toISOString().slice(0, 10);
	const blocks: string[] = [];

	for (const { pages } of eachLocaleDocPages()) {
		for (const doc of pages) {
			const pathPart = doc.href.startsWith('/') ? doc.href : `/${doc.href}`;
			const loc = `${trimmedOrigin}${pathPart}`;
			if (existing.has(loc)) continue;
			existing.add(loc);
			const lastmod = doc.meta.lastUpdated?.slice(0, 10) ?? today;
			const priority = doc.slug === '' ? '0.95' : '0.75';
			blocks.push(
				`  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
			);
		}
	}

	if (blocks.length === 0) return backendXml;
	return backendXml.replace(/\s*<\/urlset>\s*$/i, `\n${blocks.join('\n')}\n</urlset>`);
}
