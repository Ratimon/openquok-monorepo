import { describe, expect, it } from 'vitest';

import type { LinkDirectoryOpportunityDto } from '$lib/link-directory/link-directory.types';

import {
	buildBuildBacklinksGuideSections,
	listBuildBacklinksGuideOpportunityHowToSections
} from './buildBuildBacklinksGuideSections';

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
		steps: [{ order: 1, title: 'Open About', body: 'Edit website field.' }],
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

describe('buildBuildBacklinksGuideSections', () => {
	it('builds one overview and one section per published opportunity (Facebook-style)', () => {
		const sections = buildBuildBacklinksGuideSections({
			canonical: 'https://example.com/build-backlinks/facebook',
			site: {
				title: 'Facebook',
				siteUrl: 'https://www.facebook.com',
				shortDescription: 'Earn links on Facebook profiles and pages.',
				opportunities: [
					makeOpportunity({ slug: 'page-post', title: 'Facebook Page post', sortOrder: 20 }),
					makeOpportunity({
						slug: 'page-about',
						title: 'Create Facebook Page, then add your backlink',
						sortOrder: 10
					})
				]
			}
		});

		expect(sections).toHaveLength(3);
		expect(sections[0]).toMatchObject({
			sectionId: 'howto-site',
			sectionSubtitle: 'All backlink opportunities',
			sectionTitle: 'Backlink opportunities,on Facebook'
		});
		expect(sections[0].steps.map((step) => step.title)).toEqual([
			'Create Facebook Page, then add your backlink',
			'Facebook Page post'
		]);
		expect(sections[0].steps[0].howToStepUrl).toBe('#howto-page-about');
		expect(sections[0].overviewCards).toEqual([
			{
				slug: 'page-about',
				eyebrow: '1st Backlink Opportunity',
				title: 'Create Facebook Page, then add your backlink',
				description: 'Add your site under Page About.',
				anchorId: 'howto-page-about',
				icon: 'Dice1'
			},
			{
				slug: 'page-post',
				eyebrow: '2nd Backlink Opportunity',
				title: 'Facebook Page post',
				description: 'Add your site under Page About.',
				anchorId: 'howto-page-post',
				icon: 'Dice2'
			}
		]);
		expect(sections[1]).toMatchObject({
			sectionId: 'howto-page-about',
			sectionTitle: 'Create Facebook Page, then add your backlink',
			displaySectionTitle: '1st Backlink Opportunity',
			displaySectionSubtitle: 'Create Facebook Page, then add your backlink',
			displaySteps: [
				{
					order: 1,
					displayTitle: '1st Step',
					stepTitle: 'Open About',
					content: 'Edit website field.',
					iconName: 'Dice1'
				}
			]
		});
		expect(sections[1].sectionMedia).toMatchObject({
			deviceMock: 'safari',
			deviceMockContent: 'external-site-placeholder',
			mockUrl: 'https://www.facebook.com'
		});
		expect(sections[2].sectionId).toBe('howto-page-post');
	});

	it('uses siteUrl for sectionMedia mockUrl when CTA href is missing', () => {
		const sections = buildBuildBacklinksGuideSections({
			canonical: 'https://example.com/build-backlinks/example',
			site: {
				title: 'Example',
				siteUrl: 'https://example.com',
				shortDescription: null,
				opportunities: [makeOpportunity({ openquokCtaKind: 'none', slug: 'solo' })]
			}
		});

		expect(sections[1].sectionMedia).toMatchObject({
			deviceMock: 'safari',
			mockUrl: 'https://example.com'
		});
	});

	it('uses a single descriptive step when an opportunity has no sub-steps', () => {
		const sections = buildBuildBacklinksGuideSections({
			canonical: 'https://example.com/build-backlinks/example',
			site: {
				title: 'Example',
				shortDescription: null,
				opportunities: [makeOpportunity({ steps: [], slug: 'solo' })]
			}
		});

		expect(sections).toHaveLength(2);
		expect(sections[1].sectionId).toBe('howto-solo');
		expect(sections[1].steps).toHaveLength(1);
		expect(sections[1].steps[0].content).toContain('Add your site under Page About.');
	});

	it('lists only opportunity sections with JSON sub-steps for nested HowTo', () => {
		const sections = buildBuildBacklinksGuideSections({
			canonical: 'https://example.com/build-backlinks/facebook',
			site: {
				title: 'Facebook',
				shortDescription: null,
				opportunities: [
					makeOpportunity({ slug: 'with-steps', steps: [{ order: 1, title: 'A', body: 'B' }] }),
					makeOpportunity({ slug: 'no-steps', steps: [], sortOrder: 20 })
				]
			}
		});

		const forNestedHowTo = listBuildBacklinksGuideOpportunityHowToSections(sections);

		expect(forNestedHowTo).toHaveLength(1);
		expect(forNestedHowTo[0].sectionId).toBe('howto-with-steps');
		expect(sections.some((section) => section.sectionId === 'howto-no-steps')).toBe(true);
	});
});
