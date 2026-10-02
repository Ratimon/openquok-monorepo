import { describe, expect, it } from 'vitest';

import { shouldNoindexBuildBacklinksHubListing } from './shouldNoindexBuildBacklinksHubListing';

function hubUrl(path: string, query = ''): URL {
	return new URL(`https://www.example.com${path}${query ? `?${query}` : ''}`);
}

describe('shouldNoindexBuildBacklinksHubListing', () => {
	it('returns false for clean hub, category, and tag paths without query params', () => {
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks'))).toBe(false);
		expect(
			shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks/categories/launch'))
		).toBe(false);
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks/tags/dofollow'))).toBe(
			false
		);
	});

	it('returns true when page is greater than 1', () => {
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks', 'page=2'))).toBe(true);
	});

	it('returns false for page 1 or omitted page', () => {
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks', 'page=1'))).toBe(false);
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks'))).toBe(false);
	});

	it('returns true for non-empty search', () => {
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks', 'search=foo'))).toBe(
			true
		);
		expect(
			shouldNoindexBuildBacklinksHubListing(
				hubUrl('/build-backlinks/categories/launch', 'search=foo')
			)
		).toBe(true);
	});

	it('returns true when ipp is present', () => {
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks', 'ipp=20'))).toBe(true);
	});

	it('returns false for default sort (absent or explicit dr_desc)', () => {
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks'))).toBe(false);
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks', 'sort=dr_desc'))).toBe(
			false
		);
	});

	it('returns true for non-default sort', () => {
		expect(
			shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks', 'sort=title_asc'))
		).toBe(true);
	});

	it('returns true when facet query params are present', () => {
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks', 'cost=free'))).toBe(
			true
		);
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks', 'dofollow=dofollow'))).toBe(
			true
		);
		expect(shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks', 'effort=easy'))).toBe(
			true
		);
		expect(
			shouldNoindexBuildBacklinksHubListing(hubUrl('/build-backlinks', 'approval=instant'))
		).toBe(true);
		expect(
			shouldNoindexBuildBacklinksHubListing(
				hubUrl('/build-backlinks', 'opportunityTypeSlugs=profile_link')
			)
		).toBe(true);
	});
});
