import { describe, expect, it } from 'vitest';

import {
	buildPublishedQueryFromTagSlugs,
	resolveBuildBacklinksTagSlug
} from '$lib/link-directory/constants/buildBacklinksTagTaxonomy';

describe('buildBacklinksTagTaxonomy', () => {
	it('maps editorial slugs to tagSlugs only', () => {
		expect(buildPublishedQueryFromTagSlugs(['high-dr'])).toEqual({
			ok: true,
			query: { tagSlugs: ['high-dr'] }
		});
	});

	it('maps virtual dofollow to opportunity filters', () => {
		expect(buildPublishedQueryFromTagSlugs(['dofollow'])).toEqual({
			ok: true,
			query: { dofollow: ['dofollow'] }
		});
	});

	it('maps profile-link to opportunityTypeSlugs', () => {
		expect(buildPublishedQueryFromTagSlugs(['profile-link'])).toEqual({
			ok: true,
			query: { opportunityTypeSlugs: ['profile_link'] }
		});
	});

	it('rejects unknown slugs', () => {
		expect(buildPublishedQueryFromTagSlugs(['not-a-tag'])).toEqual({
			ok: false,
			unknownSlugs: ['not-a-tag']
		});
	});

	it('resolveBuildBacklinksTagSlug distinguishes kinds', () => {
		expect(resolveBuildBacklinksTagSlug('community-moderated').kind).toBe('editorial');
		expect(resolveBuildBacklinksTagSlug('github').kind).toBe('editorial');
		expect(resolveBuildBacklinksTagSlug('guest-post').kind).toBe('virtual');
		expect(resolveBuildBacklinksTagSlug('missing').kind).toBe('unknown');
	});
});
