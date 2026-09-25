import { eachLocaleDocPages } from '$lib/docs/content';
import { docsConfig } from '$lib/docs/constants';
import { docSectionKey, sidebarLabelForSection } from '$lib/docs/utils/site/docsSidebarLabel';
import type { DocPage } from '$lib/docs/types';

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

/** Body of `/llms.txt` — curated site + docs index for LLM and tool consumption. */
export async function buildLlmsTxt(siteUrl: string): Promise<string> {
	const siteTitle = docsConfig.site.title;
	const siteDesc = docsConfig.site.description;
	const blogRss = `${siteUrl}/api/v1/blog-system/rss?format=rss`;

	const lines: string[] = [];
	lines.push(`# ${siteTitle}`);
	lines.push('');
	lines.push(`> ${siteDesc}`);
	lines.push('');
	lines.push(`Curated index for LLM and tool consumption (product facts + docs).`);
	lines.push(`Full documentation text: ${siteUrl}/llms-full.txt`);
	lines.push(`Blog feed (RSS): ${blogRss}`);
	lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
	lines.push('');
	lines.push('## Product');
	lines.push('');
	lines.push(
		`- [Home](${siteUrl}/): OpenQuok overview — agentic social media scheduling, multi-channel publish, and human review.`
	);
	lines.push(
		`- [Pricing](${siteUrl}/pricing): Plan names, limits, and trial details for the hosted social scheduler.`
	);
	lines.push(
		`- [Channels](${siteUrl}/channels): Supported social networks and per-channel scheduling guides.`
	);
	lines.push(
		`- [Agents](${siteUrl}/agents): Agent / MCP hosts that connect to OpenQuok (CLI, Cursor, Claude Code, and more).`
	);
	lines.push(
		`- [Compare](${siteUrl}/compare): Side-by-side comparisons vs other social schedulers.`
	);
	lines.push(
		`- [Alternatives](${siteUrl}/alternatives): Alternative pages for Buffer, Hootsuite, and similar tools.`
	);
	lines.push(`- [About](${siteUrl}/about): Company and product positioning.`);
	lines.push(`- [Blog](${siteUrl}/blog): Product updates and scheduling guides.`);
	lines.push(`- [Playbooks](${siteUrl}/playbooks): Viral format playbooks for social publishing.`);
	lines.push(
		`- [Building blocks](${siteUrl}/building-blocks): Skills and MCP servers for agent workflows.`
	);
	lines.push('');

	const localePages = await eachLocaleDocPages();

	for (const { locale, localeLabel, pages } of localePages) {
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

	return lines.join('\n').trimEnd() + '\n';
}
