import { describe, expect, it } from 'vitest';

import {
	buildAgentChannelPageConfig,
	buildAgentsChannelAudienceSection
} from '$lib/content/constants/agents/channels/general';
import { openclawAgentChannelHost } from '$lib/content/constants/agents/channels/hosts/openclaw';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';
import { getPublicMcpLandingBySlug } from '$lib/content/constants/mcps';
import { getPublicAgentHostBySlug } from '$lib/content/constants/agents';
import { customizeAgentsChannelFeatureSections } from '$lib/content/utils/buildAgentsChannelFeatureSections';

const MAX_DIRECTORY_AUDIENCE_DESCRIPTION_LENGTH = 130;

describe('buildAgentsChannelAudienceSection directory channels', () => {
	const peerpush = getPublicChannelBySlug('peerpush');
	expect(peerpush).toBeDefined();

	it('replaces long catalog copy with short lines for MCP clients', () => {
		for (const mcpSlug of ['claude-code', 'cursor', 'warp'] as const) {
			const mcp = getPublicMcpLandingBySlug(mcpSlug);
			expect(mcp).toBeDefined();

			const section = buildAgentsChannelAudienceSection({
				channel: peerpush!,
				agentLabel: mcp!.label,
				mode: 'mcp-client'
			});

			for (const card of section.audienceCards) {
				expect(card.description.length).toBeLessThanOrEqual(MAX_DIRECTORY_AUDIENCE_DESCRIPTION_LENGTH);
				expect(card.description).not.toMatch(/mass rejections|waking up/i);
			}
			expect(section.audienceTitle).toContain('OpenQuok');
		}
	});

	it('replaces Connect Once social copy on agent host × directory feature rows', () => {
		const openclaw = getPublicAgentHostBySlug('openclaw');
		expect(openclaw).toBeDefined();

		const channelConfig = buildAgentChannelPageConfig(openclawAgentChannelHost, peerpush!);
		const sections = customizeAgentsChannelFeatureSections(
			openclaw!.featureSections,
			peerpush!,
			channelConfig,
			'agent-host',
			'OpenClaw'
		);

		const connectRow = sections.find((section) => section.subtitle === 'Connect Once');
		expect(connectRow?.description).toContain('directory');
		expect(connectRow?.description).not.toMatch(/draft and schedule/i);
	});
});
