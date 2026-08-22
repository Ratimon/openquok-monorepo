import { describe, expect, it } from 'vitest';

import {
	CATALOG_LISTING_TAG_GROUP_AUTONOMOUS_AGENTS,
	CATALOG_LISTING_TAG_GROUP_SOCIAL_PLATFORMS,
	CATALOG_LISTING_TAG_GROUP_TEXT,
	filterMissingCatalogListingTags,
	listExpectedCatalogListingTags
} from './catalogListingTags';

describe('listExpectedCatalogListingTags', () => {
	it('includes Grok Bot from /agents and Dev.to from /channels', () => {
		const tags = listExpectedCatalogListingTags();
		const bySlug = new Map(tags.map((tag) => [tag.slug, tag]));

		const grokBot = bySlug.get('grok-bot');
		expect(grokBot).toMatchObject({
			name: 'Grok Bot',
			slug: 'grok-bot',
			source: 'agents',
			groupNames: [CATALOG_LISTING_TAG_GROUP_AUTONOMOUS_AGENTS]
		});
		expect(grokBot?.description).toContain('Grok Bot');

		const devto = bySlug.get('devto');
		expect(devto).toMatchObject({
			name: 'Dev.to',
			slug: 'devto',
			source: 'channels'
		});
		expect(devto?.groupNames).toEqual([
			CATALOG_LISTING_TAG_GROUP_SOCIAL_PLATFORMS,
			CATALOG_LISTING_TAG_GROUP_TEXT
		]);
	});
});

describe('filterMissingCatalogListingTags', () => {
	it('returns Grok Bot and Dev.to when those slugs are absent', () => {
		const missing = filterMissingCatalogListingTags([
			{ slug: 'openclaw' },
			{ slug: 'hermes' },
			{ slug: 'threads' }
		]);
		const missingSlugs = missing.map((tag) => tag.slug);

		expect(missingSlugs).toContain('grok-bot');
		expect(missingSlugs).toContain('devto');
		expect(missingSlugs).not.toContain('openclaw');
		expect(missingSlugs).not.toContain('threads');
	});

	it('hides a catalog tag once a matching slug exists', () => {
		const missing = filterMissingCatalogListingTags([{ slug: 'grok-bot' }, { slug: 'devto' }]);
		const missingSlugs = missing.map((tag) => tag.slug);

		expect(missingSlugs).not.toContain('grok-bot');
		expect(missingSlugs).not.toContain('devto');
	});
});
