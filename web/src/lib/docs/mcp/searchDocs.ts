import { docsConfig } from '$lib/docs/constants';

import { loadDocsSearchIndex } from './loadDocsSearchIndex';
import type { DocsMcpSearchIndexEntry } from './searchIndex.types';

export type DocsSearchHit = {
	slug: string;
	title: string;
	description: string;
	url: string;
	locale: string;
	excerpt?: string;
	score: number;
};

const MAX_RESULTS = 20;

export function tokenizeSearchQuery(query: string): string[] {
	return query
		.toLowerCase()
		.split(/\s+/)
		.map((t) => t.trim())
		.filter(Boolean);
}

export function localeMatchesSearchFilter(pageLocale: string, filter?: string): boolean {
	if (!filter) return true;
	const def = docsConfig.i18n?.defaultLocale ?? 'en';
	const normalized = filter === def ? def : filter;
	return pageLocale === normalized;
}

export function scoreSearchIndexEntry(entry: DocsMcpSearchIndexEntry, tokens: string[]): number {
	const title = entry.title.toLowerCase();
	const description = entry.description.toLowerCase();
	const slug = entry.slug.toLowerCase();
	const excerpt = entry.excerpt.toLowerCase();
	let score = 0;
	for (const token of tokens) {
		if (title.includes(token)) score += 4;
		if (slug.includes(token)) score += 3;
		if (description.includes(token)) score += 2;
		if (excerpt.includes(token)) score += 1;
	}
	return score;
}

export function searchDocsIndex(
	entries: DocsMcpSearchIndexEntry[],
	query: string,
	siteUrl: string,
	language?: string
): DocsSearchHit[] {
	const tokens = tokenizeSearchQuery(query);
	if (!tokens.length) return [];

	const hits: DocsSearchHit[] = [];

	for (const entry of entries) {
		if (!localeMatchesSearchFilter(entry.locale, language)) continue;
		const score = scoreSearchIndexEntry(entry, tokens);
		if (score <= 0) continue;
		hits.push({
			slug: entry.slug,
			title: entry.title,
			description: entry.description,
			url: `${siteUrl.replace(/\/$/, '')}${entry.href}`,
			locale: entry.locale,
			excerpt: entry.excerpt || undefined,
			score
		});
	}

	hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
	return hits.slice(0, MAX_RESULTS);
}

export function searchDocs(query: string, siteUrl: string, language?: string): DocsSearchHit[] {
	const entries = loadDocsSearchIndex();
	return searchDocsIndex(entries, query, siteUrl, language);
}
