import { describe, expect, it } from 'vitest';

import { stringToSlug } from '$lib/ui/helpers/common';
import {
	CATALOG_LISTING_TAG_GROUP_AUTONOMOUS_AGENTS,
	CATALOG_LISTING_TAG_GROUP_SOCIAL_PLATFORMS,
	CATALOG_LISTING_TAG_GROUP_TEXT,
	CATALOG_LISTING_TAG_GROUP_VIDEOS,
	filterMissingCatalogListingTags,
	listExpectedCatalogListingTags
} from './catalogListingTags';

describe('listExpectedCatalogListingTags', () => {
	it('includes Grok Bot and ThinkRail from /agents and Dev.to from /channels', () => {
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

		const thinkrail = bySlug.get('thinkrail');
		expect(thinkrail).toMatchObject({
			name: 'ThinkRail',
			slug: 'thinkrail',
			source: 'agents',
			groupNames: [CATALOG_LISTING_TAG_GROUP_AUTONOMOUS_AGENTS]
		});
		expect(thinkrail?.description).toContain('ThinkRail');

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

	it('uses a TikTok Business name that slugs to tiktok-business and tags Videos', () => {
		const tags = listExpectedCatalogListingTags();
		const tiktokBusiness = tags.find((tag) => tag.slug === 'tiktok-business');

		expect(tiktokBusiness).toMatchObject({
			name: 'TikTok Business',
			slug: 'tiktok-business',
			source: 'channels'
		});
		expect(stringToSlug(tiktokBusiness!.name)).toBe('tiktok-business');
		expect(tiktokBusiness?.groupNames).toEqual([
			CATALOG_LISTING_TAG_GROUP_SOCIAL_PLATFORMS,
			CATALOG_LISTING_TAG_GROUP_VIDEOS
		]);
		expect(tiktokBusiness?.description).toContain('custom video covers');
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
		expect(missingSlugs).toContain('thinkrail');
		expect(missingSlugs).toContain('devto');
		expect(missingSlugs).toContain('tiktok-business');
		expect(missingSlugs).not.toContain('openclaw');
		expect(missingSlugs).not.toContain('threads');
	});

	it('hides a catalog tag once a matching slug exists', () => {
		const missing = filterMissingCatalogListingTags([
			{ slug: 'grok-bot' },
			{ slug: 'thinkrail' },
			{ slug: 'devto' }
		]);
		const missingSlugs = missing.map((tag) => tag.slug);

		expect(missingSlugs).not.toContain('grok-bot');
		expect(missingSlugs).not.toContain('thinkrail');
		expect(missingSlugs).not.toContain('devto');
	});
});
