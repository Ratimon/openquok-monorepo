import { describe, expect, it } from 'vitest';

import {
	buildAgentsLandingBreadcrumbItems,
	buildApiMarketingLandingBreadcrumbItems,
	buildChannelsLandingBreadcrumbItems,
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
	it('omits Home on the channels hub', () => {
		expect(buildChannelsLandingBreadcrumbItems({})).toEqual([
			{ label: 'Supported Channels' }
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
