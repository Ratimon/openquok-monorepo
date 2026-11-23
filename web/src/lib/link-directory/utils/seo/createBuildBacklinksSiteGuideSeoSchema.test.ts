import { describe, expect, it } from 'vitest';

import {
	createBuildBacklinksSiteGuidePlatformOrganizationSchema,
	createBuildBacklinksSiteGuideWebPageSchema
} from './createBuildBacklinksSiteGuideSeoSchema';

const canonical = 'https://example.com/build-backlinks/github';

describe('createBuildBacklinksSiteGuidePlatformOrganizationSchema', () => {
	it('uses canonical #platform @id and site URL as Organization url', () => {
		const org = createBuildBacklinksSiteGuidePlatformOrganizationSchema({
			canonicalUrl: canonical,
			siteTitle: 'GitHub',
			siteUrl: 'https://github.com',
			logoUrl: null
		});

		expect(org['@type']).toBe('Organization');
		expect(org['@id']).toBe(`${canonical}#platform`);
		expect(org.name).toBe('GitHub');
		expect(org.url).toBe('https://github.com');
		expect(org.logo).toBeUndefined();
	});

	it('includes ImageObject logo when logoUrl is set', () => {
		const org = createBuildBacklinksSiteGuidePlatformOrganizationSchema({
			canonicalUrl: canonical,
			siteTitle: 'GitHub',
			siteUrl: 'https://github.com',
			logoUrl: 'https://cdn.example.com/github.png'
		});

		expect(org.logo).toEqual({
			'@type': 'ImageObject',
			url: 'https://cdn.example.com/github.png'
		});
	});
});

describe('createBuildBacklinksSiteGuideWebPageSchema', () => {
	it('links mainEntity to site HowTo and about to platform Organization', () => {
		const page = createBuildBacklinksSiteGuideWebPageSchema({
			canonical,
			origin: 'https://example.com',
			companyName: 'OpenQuok',
			name: 'GitHub',
			description: 'Ways to earn links on GitHub.'
		});

		expect(page['@id']).toBe(`${canonical}#webpage`);
		expect(page.mainEntity).toEqual({ '@id': `${canonical}#howto-site` });
		expect(page.about).toEqual({ '@id': `${canonical}#platform` });
	});
});
