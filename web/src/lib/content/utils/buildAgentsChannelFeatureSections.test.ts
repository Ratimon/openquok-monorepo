import { describe, expect, it } from 'vitest';

import { getPublicAgentHostBySlug } from '$lib/content/constants/agents';
import { getPublicAgentChannelBySlug } from '$lib/content/constants/agents/channels';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';
import { getPublicMcpLandingBySlug } from '$lib/content/constants/mcps';
import { customizeAgentsChannelFeatureSections } from '$lib/content/utils/buildAgentsChannelFeatureSections';

describe('customizeAgentsChannelFeatureSections', () => {
	it('merges insights copy from the section whose bentoId ends with -insights', () => {
		const baseAgent = getPublicAgentHostBySlug('openclaw');
		const facebookChannel = getPublicChannelBySlug('facebook');
		const facebookConfig = getPublicAgentChannelBySlug('openclaw', 'facebook');

		expect(baseAgent).toBeDefined();
		expect(facebookChannel).toBeDefined();
		expect(facebookConfig).toBeDefined();

		const insightsSection = facebookChannel!.featureSections.find(
			(section) => section.bentoId === 'facebook-insights'
		);
		expect(insightsSection).toBeDefined();

		const reorderedSections = [
			insightsSection!,
			...facebookChannel!.featureSections.filter((section) => section.bentoId !== 'facebook-insights')
		];

		const sections = customizeAgentsChannelFeatureSections(
			baseAgent!.featureSections,
			{ ...facebookChannel!, featureSections: reorderedSections },
			facebookConfig!,
			'agent-host',
			'OpenClaw'
		);

		const analyticsRow = sections.find((section) => section.bentoId === 'facebook-insights');
		expect(analyticsRow?.title).toBe(insightsSection!.title);
		expect(analyticsRow?.description).toBe(insightsSection!.description);
		expect(analyticsRow?.description).toContain('per-Page');
	});

	it('uses channel follow-ups in the analytics slot and drops scale when analytics are unsupported', () => {
		const baseAgent = getPublicAgentHostBySlug('grok-bot');
		const skoolChannel = getPublicChannelBySlug('skool');
		const skoolConfig = getPublicAgentChannelBySlug('grok-bot', 'skool');

		expect(baseAgent).toBeDefined();
		expect(skoolChannel).toBeDefined();
		expect(skoolConfig).toBeDefined();

		const followUpsSection = skoolChannel!.featureSections.find(
			(section) => section.bentoId === 'skool-follow-ups'
		);
		expect(followUpsSection).toBeDefined();

		const sections = customizeAgentsChannelFeatureSections(
			baseAgent!.featureSections,
			skoolChannel!,
			skoolConfig!,
			'agent-host',
			'Grok Bot'
		);

		expect(sections.some((section) => section.subtitle === 'Scale what works')).toBe(false);
		expect(sections.some((section) => section.subtitle === 'Analytics')).toBe(false);

		const followUpRow = sections.find((section) => section.bentoId === 'skool-follow-ups');
		expect(followUpRow).toBeDefined();
		expect(followUpRow?.subtitle).toBe('Follow-up comments');
		expect(followUpRow?.title).toBe(followUpsSection!.title);
		expect(followUpRow?.cliCommands).toContain('skool-follow-up.json');
		expect(followUpRow?.cliCommands).not.toContain('analytics:platform');
	});

	it('maps directory catalog sections for peerpush and drops scale row', () => {
		const baseMcp = getPublicMcpLandingBySlug('claude-code');
		const peerpushChannel = getPublicChannelBySlug('peerpush');
		const peerpushConfig = getPublicAgentChannelBySlug('claude-code', 'peerpush');

		expect(baseMcp).toBeDefined();
		expect(peerpushChannel).toBeDefined();
		expect(peerpushConfig).toBeDefined();

		const directoryAnalyticsSection = peerpushChannel!.featureSections.find(
			(section) => section.bentoId === 'directory-analytics'
		);
		expect(directoryAnalyticsSection).toBeDefined();

		const sections = customizeAgentsChannelFeatureSections(
			baseMcp!.featureSections,
			peerpushChannel!,
			peerpushConfig!,
			'mcp-client',
			'Claude Code',
			baseMcp!.mcpClient
		);

		const minimalSetup = sections.find((section) => section.subtitle === 'Minimal setup');
		expect(minimalSetup?.title).toContain('prep directory launches');
		expect(minimalSetup?.title).not.toMatch(/schedule without switching/i);
		expect(minimalSetup?.description).toContain('Claude Code');
		expect(minimalSetup?.description).not.toMatch(/draft posts|queue schedules/i);
		const directorySessionMock = minimalSetup?.parallelMocks?.find(
			(mock) => mock.deviceMock === 'desktop'
		);
		expect(directorySessionMock?.deviceMockContent).toBe('mcp-directory-launch-claude-code');
		expect(directorySessionMock?.deviceMockContent).not.toMatch(/^mcp-verify-/);

		expect(sections.some((section) => section.subtitle === 'Scale what works')).toBe(false);

		const analyticsRow = sections.find((section) => section.bentoId === 'directory-analytics');
		expect(analyticsRow).toBeDefined();
		expect(analyticsRow?.title).toBe(directoryAnalyticsSection!.title);
		expect(analyticsRow?.description).toBe(directoryAnalyticsSection!.description);
		expect(analyticsRow?.description).toMatch(/domain rating/i);
		expect(analyticsRow?.title).not.toMatch(/winners/i);
		expect(analyticsRow?.description).not.toMatch(/winners|impressions/i);
		expect(analyticsRow?.cliCommands).toContain('checkedAt');

		const kanbanRow = sections.find((section) =>
			section.description?.includes('openquok directory:*')
		);
		expect(kanbanRow).toBeDefined();
		expect(kanbanRow?.subtitle).toBe('Workspaces and team');
		expect(kanbanRow?.bentoId).toBe('directory-workspaces-team');
	});

});
