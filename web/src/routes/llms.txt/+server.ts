import { eachLocaleDocPages } from '$lib/docs/content';
import { docsConfig } from '$lib/docs/constants';
import { docSectionKey, sidebarLabelForSection } from '$lib/docs/utils/docs-sidebar-label';
import { resolvePublicSiteUrl } from '$lib/docs/utils/resolve-public-site-url';
import type { DocPage } from '$lib/docs/types';
import type { RequestHandler } from './$types';

function groupBySection(pages: DocPage[]): Map<string, DocPage[]> {
	const map = new Map<string, DocPage[]>();
	for (const p of pages) {
		const key = docSectionKey(p.slug) || '_root';
		if (!map.has(key)) map.set(key, []);
		map.get(key)!.push(p);
	}
	return map;
}

function orderedSectionKeys(grouped: Map<string, DocPage[]>): string[] {
	const keys: string[] = [];
	for (const s of docsConfig.sidebar) {
		const dir = s.autogenerate?.directory;
		if (dir && grouped.has(dir) && dir !== '_root') keys.push(dir);
	}
	for (const k of grouped.keys()) {
		if (k !== '_root' && !keys.includes(k)) keys.push(k);
	}
	return keys;
}

export const GET: RequestHandler = async ({ url }) => {
	const siteUrl = resolvePublicSiteUrl(url);
	const siteTitle = docsConfig.site.title;
	const siteDesc = docsConfig.site.description;
	const blogRss = `${siteUrl}/api/v1/blog-system/rss?format=rss`;

	const lines: string[] = [];
	lines.push(`# ${siteTitle}`);
	lines.push('');
	lines.push(`> ${siteDesc}`);
	lines.push('');
	lines.push(`Documentation index for LLM and tool consumption (all locales).`);
	lines.push(`Full page text: ${siteUrl}/llms-full.txt`);
	lines.push(`Blog feed (RSS): ${blogRss}`);
	lines.push('');

	for (const { locale, localeLabel, pages } of eachLocaleDocPages()) {
		lines.push(`## ${localeLabel} (${locale})`);
		lines.push('');

		const grouped = groupBySection(pages);
		const root = grouped.get('_root') ?? [];
		root.sort((a, b) => (a.meta.order ?? 999) - (b.meta.order ?? 999));
		for (const doc of root) {
			lines.push(`- [${doc.meta.title}](${siteUrl}${doc.href}): ${doc.meta.description}`);
		}
		if (root.length) lines.push('');

		for (const section of orderedSectionKeys(grouped)) {
			const entries = grouped.get(section);
			if (!entries?.length) continue;
			entries.sort((a, b) => (a.meta.order ?? 999) - (b.meta.order ?? 999));
			lines.push(`### ${sidebarLabelForSection(section)}`);
			lines.push('');
			for (const doc of entries) {
				lines.push(`- [${doc.meta.title}](${siteUrl}${doc.href}): ${doc.meta.description}`);
			}
			lines.push('');
		}
	}

	return new Response(lines.join('\n').trimEnd() + '\n', {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

export const prerender = true;
