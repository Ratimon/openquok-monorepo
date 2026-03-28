import { eachLocaleDocPages, getRawContent } from '$lib/docs/content';
import { docsConfig } from '$lib/docs/constants';
import { docSectionKey, sidebarLabelForSection } from '$lib/docs/utils/docs-sidebar-label';
import { resolvePublicSiteUrl } from '$lib/docs/utils/resolve-public-site-url';
import type { DocPage } from '$lib/docs/types';
import type { RequestHandler } from './$types';

function parseFrontmatterAndContent(raw: string): { content: string } {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!match) return { content: raw.trim() };
	return { content: match[2]!.trim() };
}

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

function emitSectionDocs(
	lines: string[],
	siteUrl: string,
	section: string,
	entries: DocPage[],
	locale: string,
	introduceSection: boolean
): void {
	if (introduceSection && section !== '_root') {
		lines.push('---');
		lines.push('');
		lines.push(`# ${sidebarLabelForSection(section)}`);
		lines.push('');
	}
	entries.sort((a, b) => (a.meta.order ?? 999) - (b.meta.order ?? 999));
	for (const doc of entries) {
		const raw = getRawContent(doc.slug, locale);
		const { content } = parseFrontmatterAndContent(raw);
		lines.push(`## ${doc.meta.title}`);
		lines.push(`URL: ${siteUrl}${doc.href}`);
		lines.push('');
		lines.push(content);
		lines.push('');
	}
}

export const GET: RequestHandler = async ({ url }) => {
	const siteUrl = resolvePublicSiteUrl(url);
	const siteTitle = docsConfig.site.title;
	const siteDesc = docsConfig.site.description;

	const lines: string[] = [];
	lines.push(`# ${siteTitle}`);
	lines.push('');
	lines.push(`> ${siteDesc}`);
	lines.push('');
	lines.push(`Source: ${siteUrl}`);
	lines.push('');

	for (const { locale, localeLabel, pages } of eachLocaleDocPages()) {
		lines.push('---');
		lines.push('');
		lines.push(`# ${localeLabel} (${locale})`);
		lines.push('');

		const grouped = groupBySection(pages);
		const root = grouped.get('_root') ?? [];
		emitSectionDocs(lines, siteUrl, '_root', root, locale, false);

		for (const section of orderedSectionKeys(grouped)) {
			const entries = grouped.get(section);
			if (!entries?.length) continue;
			emitSectionDocs(lines, siteUrl, section, entries, locale, true);
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
