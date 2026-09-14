import { describe, expect, it } from 'vitest';

import {
	buildPublicFooterAutonomousAgentIntegrationLinks,
	buildPublicFooterApiPayloadValidatorLinks,
	buildPublicFooterHubLinks,
	buildPublicFooterMcpIntegrationLinks,
	buildPublicFooterPublicApiDocsLinkSections,
	buildPublicFooterSelfHostSocialIntegrationLinks,
	buildPublicFooterSupportedChannelLinks
} from '$lib/config/utils/buildPublicFooterLinks';
import { listPublicAgentsForHub } from '$lib/content/constants/agents/index';
import { listPublicChannelsForHub } from '$lib/content/constants/channels/index';
import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
import { route } from '$lib/utils/path';

describe('buildPublicFooterLinks', () => {
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
			listPublicAgentsForHub().map((agent) => ({
				label: agent.agentLabel,
				href: route(getRootPathPublicAgent(agent.slug))
			}))
		);
	});

	it('lists MCP clients under the agents hub', () => {
		const links = buildPublicFooterMcpIntegrationLinks('/agents');

		expect(links[0]).toEqual({ label: 'All MCP Integrations', href: '/agents' });
		expect(links.some((link) => link.href === route(getRootPathPublicAgent('cursor')))).toBe(true);
		expect(links.some((link) => link.label === 'Cursor')).toBe(true);
	});

	it('lists every public channel under the channels hub', () => {
		const links = buildPublicFooterSupportedChannelLinks('/channels');

		expect(links[0]).toEqual({ label: 'All Supported Channels', href: '/channels' });
		expect(links.slice(1)).toEqual(
			listPublicChannelsForHub().map((channel) => ({
				label: channel.platformLabel,
				href: route(getRootPathPublicChannel(channel.slug))
			}))
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
