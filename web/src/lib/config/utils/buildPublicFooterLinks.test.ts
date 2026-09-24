import { describe, expect, it, beforeAll } from 'vitest';

import {
	buildPublicFooterAutonomousAgentIntegrationLinks,
	buildPublicFooterApiPayloadValidatorLinks,
	buildPublicFooterHubLinks,
	buildPublicFooterMcpIntegrationLinks,
	buildPublicFooterPublicApiDocsLinkSections,
	buildPublicFooterPayloadWizardLinks,
	buildPublicFooterPostingApiPlatformLinks,
	buildPublicFooterSchedulingApiPlatformLinks,
	buildPublicFooterSelfHostSocialIntegrationLinks,
	buildPublicFooterApisLinks,
	buildPublicFooterSupportedChannelLinks
} from '$lib/config/utils/buildPublicFooterLinks';
import { getPublicFooterLinks, PUBLIC_FOOTER_LINKS_STATIC } from '$lib/config/constants/config';
import { preloadDocsRegistry } from '$lib/docs/content';
import { listPublicAgentHostSeedsForFooter } from '$lib/content/constants/agents/seeds';
import { listPublicChannelLandingSeedsForFooter } from '$lib/content/constants/channels/seeds';
import { listPublicMcpLandingSeedsForFooter } from '$lib/content/constants/mcps/seeds';
import {
	getPublicApiPostingPlatformBySlug,
	getPublicApiSchedulingPlatformBySlug,
	listPublicApiPostingPlatformsForHub,
	listPublicApiSchedulingPlatformsForHub,
	PUBLIC_API_POSTING_PLATFORM_SLUGS
} from '$lib/content/constants/apis/index';
import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
import {
	getRootPathSocialMediaPostingApiPlatform,
	getRootPathSocialMediaSchedulingApiPlatform
} from '$lib/area-public/constants/getRootPathPublicApiMarketing';
import { getRootPathPublicPayloadWizardChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import { route } from '$lib/utils/path';

describe('buildPublicFooterLinks', () => {
	beforeAll(async () => {
		await preloadDocsRegistry();
	});

	it('places the hub link first, then detail links', () => {
		expect(
			buildPublicFooterHubLinks('All Skill Builder Tools', '/tools/skill-builder', [
				{ platformLabel: 'Threads', href: '/tools/skill-builder/threads' },
				{ platformLabel: 'Facebook', href: '/tools/skill-builder/facebook' }
			])
		).toEqual([
			{ label: 'All Skill Builder Tools', href: '/tools/skill-builder' },
			{ label: 'Threads', href: '/tools/skill-builder/threads' },
			{ label: 'Facebook', href: '/tools/skill-builder/facebook' }
		]);
	});

	it('lists autonomous agent hosts under the agents hub', () => {
		const links = buildPublicFooterAutonomousAgentIntegrationLinks('/agents');

		expect(links[0]).toEqual({
			label: 'All Autonomous Agent Integrations',
			href: '/agents'
		});
		expect(links.slice(1)).toEqual(
			listPublicAgentHostSeedsForFooter().map((agent) => ({
				label: agent.label,
				href: route(getRootPathPublicAgent(agent.slug))
			}))
		);
	});

	it('lists MCP clients under the agents hub', () => {
		const links = buildPublicFooterMcpIntegrationLinks('/agents');

		expect(links[0]).toEqual({ label: 'All MCP Integrations', href: '/agents' });
		expect(links.slice(1)).toEqual(
			listPublicMcpLandingSeedsForFooter().map((mcp) => ({
				label: mcp.label,
				href: route(getRootPathPublicAgent(mcp.slug))
			}))
		);
		expect(links.some((link) => link.label === 'Muse Code')).toBe(true);
	});

	it('lists every public channel under the channels hub', () => {
		const links = buildPublicFooterSupportedChannelLinks('/channels');

		expect(links[0]).toEqual({ label: 'All Supported Channels', href: '/channels' });
		expect(links.slice(1)).toEqual(
			listPublicChannelLandingSeedsForFooter().map((channel) => ({
				label: channel.label,
				href: route(getRootPathPublicChannel(channel.slug))
			}))
		);
	});

	it('lists every posting API platform under the posting API hub', () => {
		const links = buildPublicFooterPostingApiPlatformLinks('/social-media-posting-api');

		expect(links[0]).toEqual({
			label: 'All Posting APIs',
			href: '/social-media-posting-api'
		});
		expect(links.slice(1)).toEqual(
			listPublicApiPostingPlatformsForHub().map((platform) => {
				const page = getPublicApiPostingPlatformBySlug(platform.slug);
				return {
					label: page!.metaTitle,
					href: route(getRootPathSocialMediaPostingApiPlatform(platform.slug))
				};
			})
		);
		expect(links.some((link) => link.href.startsWith('/docs/'))).toBe(false);
	});

	it('lists every scheduling API platform under the scheduling API hub', () => {
		const links = buildPublicFooterSchedulingApiPlatformLinks('/social-media-scheduling-api');

		expect(links[0]).toEqual({
			label: 'All Scheduling APIs',
			href: '/social-media-scheduling-api'
		});
		expect(links.slice(1)).toEqual(
			listPublicApiSchedulingPlatformsForHub().map((platform) => {
				const page = getPublicApiSchedulingPlatformBySlug(platform.slug);
				return {
					label: page!.metaTitle,
					href: route(getRootPathSocialMediaSchedulingApiPlatform(platform.slug))
				};
			})
		);
		expect(links.some((link) => link.href.startsWith('/docs/'))).toBe(false);
	});

	it('builds the APIs footer column with capability hubs only', () => {
		const links = buildPublicFooterApisLinks(
			'/social-media-posting-api',
			'/social-media-scheduling-api'
		);

		expect(links).toEqual([
			{ label: 'All Posting APIs', href: '/social-media-posting-api' },
			{ label: 'All Scheduling APIs', href: '/social-media-scheduling-api' }
		]);
		expect(links.some((link) => link.href.startsWith('/docs/'))).toBe(false);
	});

	it('lists payload wizard tools under the payload wizard hub', () => {
		const links = buildPublicFooterPayloadWizardLinks('/tools/payload-wizard');

		expect(links[0]).toEqual({
			label: 'All Payload Wizard Tools',
			href: '/tools/payload-wizard'
		});
		expect(links.slice(1)).toEqual(
			PUBLIC_API_POSTING_PLATFORM_SLUGS.map((slug) => {
				const platform = getPublicApiPostingPlatformBySlug(slug);
				return {
					label: `${platform!.platformLabel} Payload Wizard`,
					href: route(getRootPathPublicPayloadWizardChannel(slug))
				};
			})
		);
	});

	it('lists self-host social integration guides under the docs hub', () => {
		const links = buildPublicFooterSelfHostSocialIntegrationLinks();

		expect(links[0]).toEqual({
			label: 'All self-host social integrations',
			href: '/docs/social-integration'
		});
		expect(links).toContainEqual({
			label: 'Facebook',
			href: '/docs/social-integration/facebook'
		});
		expect(links).toContainEqual({
			label: 'LinkedIn Page',
			href: '/docs/social-integration/linkedin-page'
		});
	});

	it('lists API payload validator index pages before per-endpoint sections', () => {
		const links = buildPublicFooterApiPayloadValidatorLinks('/docs/getting-started-for-public-api');

		expect(links[0]).toEqual({
			label: 'All API Payload Validators',
			href: '/docs/getting-started-for-public-api'
		});
		expect(links.slice(1)).toEqual([
			{ label: 'Integrations APIs', href: '/docs/apis-integrations' },
			{ label: 'Posts APIs', href: '/docs/apis-posts' },
			{ label: 'Analytics APIs', href: '/docs/apis-analytics' },
			{ label: 'Notifications APIs', href: '/docs/apis-notifications' },
			{ label: 'Uploads APIs', href: '/docs/apis-uploads' }
		]);
	});

	it('assembles the marketing footer with payload wizard and without API docs columns', async () => {
		const links = await getPublicFooterLinks();

		expect(links['Payload Wizard Tools']?.[0]).toEqual({
			label: 'All Payload Wizard Tools',
			href: '/tools/payload-wizard'
		});
		expect(links['Payload Wizard Tools']?.some((link) => link.href.startsWith('/docs/'))).toBe(
			false
		);
		expect(links['Integrations APIs']).toBeUndefined();
		expect(links['Posts APIs']).toBeUndefined();
		expect(links['API Payload Validators']).toBeUndefined();
		expect(PUBLIC_FOOTER_LINKS_STATIC.Tools).toContainEqual({
			label: 'Payload Wizard',
			href: '/tools/payload-wizard'
		});
	});

	it('builds public API docs sections from apis-* markdown frontmatter', () => {
		const sections = buildPublicFooterPublicApiDocsLinkSections();

		expect(Object.keys(sections)).toEqual([
			'Integrations APIs',
			'Posts APIs',
			'Analytics APIs',
			'Notifications APIs',
			'Uploads APIs'
		]);

		const integrations = sections['Integrations APIs'];
		expect(integrations?.[0]).toEqual({
			label: 'All Integrations APIs',
			href: '/docs/apis-integrations'
		});
		expect(integrations).toContainEqual({
			label: 'List Integrations',
			href: '/docs/apis-integrations/list'
		});
		expect(integrations).toContainEqual({
			label: 'List Channel Groups',
			href: '/docs/apis-integrations/groups'
		});
	});
});
