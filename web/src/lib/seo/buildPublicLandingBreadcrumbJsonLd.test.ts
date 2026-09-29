import { describe, expect, it } from 'vitest';

import {
	buildAgentsLandingBreadcrumbItems,
	buildAlternativesLandingBreadcrumbItems,
	buildApiMarketingLandingBreadcrumbItems,
	buildChannelsLandingBreadcrumbItems,
	buildCompareLandingBreadcrumbItems,
	buildListingsHubBreadcrumbItems,
	buildToolsLandingBreadcrumbItems
} from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import {
	buildBreadcrumbListItems,
	createBreadcrumbListSchema
} from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { getRootPathPublicHumanizer } from '$lib/area-public/constants/getRootPathPublicTools';

const origin = 'https://www.openquok.com';

describe('buildBreadcrumbListItems', () => {
	it('sets item URLs only on non-terminal crumbs', () => {
		const items = buildBreadcrumbListItems(
			[
				{ label: 'Home', href: '/' },
				{ label: 'Social Media Posting API', href: '/social-media-posting-api' },
				{ label: 'Threads' }
			],
			origin
		);

		expect(items).toHaveLength(3);
		expect(items[0]?.item).toBe(`${origin}/`);
		expect(items[1]?.item).toBe(`${origin}/social-media-posting-api`);
		expect(items[2]?.item).toBeUndefined();
	});
});

describe('createBreadcrumbListSchema', () => {
	it('emits Schema.org BreadcrumbList', () => {
		const schema = createBreadcrumbListSchema(
			buildApiMarketingLandingBreadcrumbItems({
				capability: 'scheduling',
				hubMetaTitle: 'Social Media Scheduling API',
				platformLabel: 'LinkedIn'
			}),
			origin
		);

		expect(schema['@type']).toBe('BreadcrumbList');
		expect(schema.itemListElement).toHaveLength(3);
	});
});

describe('buildAgentsLandingBreadcrumbItems', () => {
	it('links MCP integration hub with scroll target', () => {
		const crumbs = buildAgentsLandingBreadcrumbItems({
			variant: 'mcp-client',
			agentSlug: 'cursor',
			agentLabel: 'Cursor',
			channelLabel: 'LinkedIn'
		});

		expect(crumbs[1]?.href).toBe('/agents#public-mcp-hub-heading');
		expect(crumbs[2]?.href).toBe('/agents/cursor');
		expect(crumbs[3]?.label).toBe('LinkedIn');
		expect(crumbs[3]?.href).toBeUndefined();
	});
});

describe('buildChannelsLandingBreadcrumbItems', () => {
	it('includes Home on the channels hub and detail pages', () => {
		expect(buildChannelsLandingBreadcrumbItems({})).toEqual([
			{ label: 'Home', href: '/' },
			{ label: 'Supported Channels' }
		]);

		expect(buildChannelsLandingBreadcrumbItems({ platformLabel: 'Facebook' })).toEqual([
			{ label: 'Home', href: '/' },
			{ label: 'Supported Channels', href: '/channels' },
			{ label: 'Facebook' }
		]);
	});
});

describe('buildListingsHubBreadcrumbItems', () => {
	it('builds playbooks category-tag trail', () => {
		expect(
			buildListingsHubBreadcrumbItems({
				kind: 'playbooks',
				variant: 'category-tag',
				categoryLabel: 'Marketing',
				categorySlug: 'marketing',
				tagLabel: 'TikTok'
			})
		).toEqual([
			{ label: 'Home', href: '/' },
			{ label: 'Playbooks', href: '/playbooks' },
			{ label: 'Marketing', href: '/playbooks/categories/marketing' },
			{ label: 'TikTok' }
		]);
	});
});

describe('buildToolsLandingBreadcrumbItems', () => {
	it('builds a three-level tool channel trail', () => {
		const crumbs = buildToolsLandingBreadcrumbItems({
			toolLabel: 'Humanizer',
			toolRootPath: getRootPathPublicHumanizer(),
			channelLabel: 'LinkedIn',
			channelRootPath: `${getRootPathPublicHumanizer()}/linkedin`
		});

		expect(crumbs).toEqual([
			{ label: 'Free Tools', href: '/tools' },
			{ label: 'Humanizer', href: '/tools/humanizer' },
			{ label: 'LinkedIn' }
		]);
	});
});

describe('buildCompareLandingBreadcrumbItems', () => {
	it('builds hub and detail trails', () => {
		expect(buildCompareLandingBreadcrumbItems({ variant: 'hub' })).toEqual([
			{ label: 'Home', href: '/' },
			{ label: 'Compare' }
		]);

		expect(
			buildCompareLandingBreadcrumbItems({
				variant: 'detail',
				leftProductName: 'OpenQuok',
				rightProductName: 'Buffer'
			})
		).toEqual([
			{ label: 'Home', href: '/' },
			{ label: 'Compare', href: '/compare' },
			{ label: 'OpenQuok vs Buffer' }
		]);
	});
});

describe('buildAlternativesLandingBreadcrumbItems', () => {
	it('builds hub and detail trails', () => {
		expect(buildAlternativesLandingBreadcrumbItems({ variant: 'hub' })).toEqual([
			{ label: 'Home', href: '/' },
			{ label: 'Alternatives' }
		]);

		expect(
			buildAlternativesLandingBreadcrumbItems({
				variant: 'detail',
				pageLabel: 'Hootsuite alternatives'
			})
		).toEqual([
			{ label: 'Home', href: '/' },
			{ label: 'Alternatives', href: '/alternatives' },
			{ label: 'Hootsuite alternatives' }
		]);
	});
});
