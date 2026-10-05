import { describe, expect, it } from 'vitest';

import type { LinkDirectoryOpportunityDto } from '$lib/link-directory/link-directory.types';

import { buildPublicFeaturesOrderedHowToSchemas } from '$lib/seo/featuresOrderedHowToSchema';

import { buildBuildBacklinksGuideSections } from './buildBuildBacklinksGuideSections';
import {
	createBuildBacklinksOpportunityHowToSchemas,
	createBuildBacklinksSiteGuideHowToSchema
} from './createBuildBacklinksSiteGuideHowToSchema';

const facebookCanonical = 'https://www.openquok.com/build-backlinks/facebook';

function makeOpportunity(
	overrides: Partial<LinkDirectoryOpportunityDto> = {}
): LinkDirectoryOpportunityDto {
	return {
		id: 'opp-1',
		siteId: 'site-1',
		slug: 'page-about',
		title: 'Create Facebook Page, then add your backlink',
		opportunityTypeId: 'type-1',
		opportunityType: {
			id: 'type-1',
			slug: 'profile_link',
			label: 'Profile link',
			description: null,
			sortOrder: 0
		},
		effort: 'easy',
		approvalMode: 'instant',
		approvalTimeHint: null,
		dofollow: 'nofollow',
		costTier: 'free',
		costNote: null,
		description: 'Add your site under Page About.',
		steps: [
			{ order: 1, title: 'Open About', body: 'Edit website field.' }
		],
		openquokCtaKind: 'connect_channel',
		openquokChannelSlug: 'facebook',
		openquokPlugName: null,
		ctaHref: null,
		ctaLabel: 'Connect Facebook',
		sortOrder: 10,
		isAdminPublished: true,
		publishedAt: null,
		...overrides
	};
}

describe('createBuildBacklinksSiteGuideHowToSchema', () => {
	it('orders opportunities by sortOrder for site-level steps', () => {
		const schema = createBuildBacklinksSiteGuideHowToSchema({
			canonicalUrl: facebookCanonical,
			siteTitle: 'Facebook',
			opportunities: [
				makeOpportunity({ slug: 'page-post', title: 'Facebook Page post', sortOrder: 20 }),
				makeOpportunity({ slug: 'page-about', title: 'Create Facebook Page, then add your backlink', sortOrder: 10 })
			]
		});

		expect(schema).toMatchObject({
			'@type': 'HowTo',
			'@id': `${facebookCanonical}#howto-site`,
			step: [
				{
					name: 'Create Facebook Page, then add your backlink',
					url: `${facebookCanonical}#howto-page-about`
				},
				{
					name: 'Facebook Page post',
					url: `${facebookCanonical}#howto-page-post`
				}
			]
		});
	});

	it('aligns guide section ids with HowTo @id and overview step urls (Facebook-style)', () => {
		const opportunities = [
			makeOpportunity({ slug: 'page-post', title: 'Facebook Page post', sortOrder: 20 }),
			makeOpportunity({
				slug: 'page-about',
				title: 'Create Facebook Page, then add your backlink',
				sortOrder: 10
			})
		];

		const guideSections = buildBuildBacklinksGuideSections({
			canonical: facebookCanonical,
			site: {
				title: 'Facebook',
				siteUrl: 'https://www.facebook.com',
				shortDescription: 'Earn links on Facebook profiles and pages.',
				opportunities
			}
		});

		const siteHowTo = createBuildBacklinksSiteGuideHowToSchema({
			canonicalUrl: facebookCanonical,
			siteTitle: 'Facebook',
			siteDescription: 'Earn links on Facebook profiles and pages.',
			opportunities
		});

		const nestedHowTos = createBuildBacklinksOpportunityHowToSchemas({
			canonicalUrl: facebookCanonical,
			opportunities
		});

		const allHowTos = buildPublicFeaturesOrderedHowToSchemas({
			pageUrl: facebookCanonical,
			sections: guideSections
		});

		expect(guideSections.map((section) => section.sectionId)).toEqual([
			'howto-site',
			'howto-page-about',
			'howto-page-post'
		]);

		expect(siteHowTo['@id']).toBe(`${facebookCanonical}#howto-site`);
		expect(nestedHowTos).toHaveLength(2);
		expect(nestedHowTos.map((node) => node['@id'])).toEqual([
			`${facebookCanonical}#howto-page-about`,
			`${facebookCanonical}#howto-page-post`
		]);

		for (const section of guideSections) {
			const matching = allHowTos.find((node) => node['@id'] === `${facebookCanonical}#${section.sectionId}`);
			expect(matching, `missing HowTo for #${section.sectionId}`).toBeDefined();
		}

		expect(siteHowTo).toMatchObject({
			step: [
				{ url: `${facebookCanonical}#howto-page-about` },
				{ url: `${facebookCanonical}#howto-page-post` }
			]
		});
	});

	it('resolves howToStepUrl hash links against the page canonical', () => {
		const nodes = buildPublicFeaturesOrderedHowToSchemas({
			pageUrl: `${facebookCanonical}#howto-site`,
			sections: [
				{
					sectionId: 'howto-site',
					sectionTitle: 'Backlink opportunities,on Facebook',
					steps: [
						{
							id: 1,
							title: 'Add your site to Facebook',
							content: 'Publish a profile link.',
							howToStepUrl: '#howto-page-about',
							iconName: 'Link'
						}
					]
				}
			]
		});

		expect(nodes[0]).toMatchObject({
			'@id': `${facebookCanonical}#howto-site`,
			step: [{ url: `${facebookCanonical}#howto-page-about` }]
		});
	});

	it('emits nested HowTo only when opportunity has sub-steps', () => {
		const nodes = createBuildBacklinksOpportunityHowToSchemas({
			canonicalUrl: 'https://example.com/build-backlinks/facebook',
			opportunities: [
				makeOpportunity({ steps: [] }),
				makeOpportunity({ slug: 'page-about', steps: [{ order: 1, title: 'A', body: 'B' }] })
			]
		});

		expect(nodes).toHaveLength(1);
		expect(nodes[0]['@id']).toContain('#howto-page-about');
	});
});
