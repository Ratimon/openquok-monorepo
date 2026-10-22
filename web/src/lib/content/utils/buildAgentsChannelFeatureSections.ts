import type { PublicAgentChannelPageConfig } from '$lib/content/constants/agents/channels';
import type { PublicAgentFeatureSection } from '$lib/content/constants/agents';
import { CHANNEL_INSIGHTS_BENTO_SUFFIX } from '$lib/content/constants/channels/catalog/shared';
import {
	isPublicDirectoryChannel,
	type PublicChannelFeatureSection,
	type PublicChannelLandingPageViewModel
} from '$lib/content/constants/channels';
import { channelProviderIdentifiersSupportAnalytics } from '$data/social-providers';
import type { McpClient } from '$lib/developers/utils/getMcpClientConfig';

import {
	buildDirectoryAgentChannelConnectOnceFeatureCopy,
	buildDirectoryAgentChannelMinimalSetupFeatureCopy,
	buildDirectoryAgentChannelMinimalSetupParallelMocks,
	DIRECTORY_AGENT_CONNECT_ONCE_SUBTITLE,
	DIRECTORY_AGENT_MINIMAL_SETUP_SUBTITLE
} from '$lib/content/utils/buildDirectoryChannelLandingVmCopy';

const KANBAN_SECTION_SUBTITLE = 'Kanban + smart filters';
const ANALYTICS_SECTION_SUBTITLE = 'Analytics';
const SCALE_SECTION_SUBTITLE = 'Scale what works';

/**
 * Compose/settings row on `/channels/{slug}` — reused for the agent channel
 * "Kanban + smart filters" slot (platform-specific bento + copy).
 */
const CHANNEL_COMPOSE_FEATURE_INDEX = 1;

const DIRECTORY_ANALYTICS_BENTO_ID = 'directory-analytics';

function findDirectoryAnalyticsSection(
	sections: PublicChannelFeatureSection[]
): PublicChannelFeatureSection | undefined {
	return sections.find((section) => section.bentoId === DIRECTORY_ANALYTICS_BENTO_ID);
}

function findChannelInsightsSection(
	sections: PublicChannelFeatureSection[]
): PublicChannelFeatureSection | undefined {
	return sections.find((section) => section.bentoId?.endsWith(CHANNEL_INSIGHTS_BENTO_SUFFIX));
}

/** Follow-up rows for channels without OpenQuok workspace/post analytics (e.g. Skool). */
function findChannelFollowUpFeatureSection(
	sections: PublicChannelFeatureSection[]
): PublicChannelFeatureSection | undefined {
	return (
		sections.find((section) => section.bentoId?.endsWith('-follow-ups')) ??
		sections.find((section) => section.bentoId?.endsWith('-threads'))
	);
}

function findChannelFeatureForAnalyticsSlot(
	sections: PublicChannelFeatureSection[],
	supportsAnalytics: boolean
): PublicChannelFeatureSection | undefined {
	if (supportsAnalytics) {
		return findChannelInsightsSection(sections);
	}
	return findChannelFollowUpFeatureSection(sections);
}

function mergeChannelFeatureIntoAgentSection(
	agentSection: PublicAgentFeatureSection,
	channelSection: PublicChannelFeatureSection | undefined,
	cliOverlay: Pick<PublicAgentFeatureSection, 'cliCommands' | 'cliCommandsTitle'>
): PublicAgentFeatureSection {
	if (!channelSection) {
		return { ...agentSection, ...cliOverlay };
	}

	return {
		...agentSection,
		subtitle: channelSection.subtitle,
		title: channelSection.title,
		description: channelSection.description,
		bentoId: channelSection.bentoId,
		mediaOnRight: channelSection.mediaOnRight,
		imageAlt: channelSection.imageAlt,
		deviceMock: undefined,
		deviceMockContent: undefined,
		imageSrc: undefined,
		parallelMocks: undefined,
		cliCommandsTitle: cliOverlay.cliCommandsTitle ?? agentSection.cliCommandsTitle,
		cliCommands: cliOverlay.cliCommands ?? agentSection.cliCommands
	};
}

/**
 * Overlay agent/MCP feature rows with copy and bentos from the channel catalog
 * (same source as `/channels/{slug}`).
 */
function customizeDirectoryAgentsChannelFeatureSections(
	sections: PublicAgentFeatureSection[],
	channel: PublicChannelLandingPageViewModel,
	channelConfig: PublicAgentChannelPageConfig,
	mode: 'agent-host' | 'mcp-client',
	assistantLabel: string,
	mcpClient?: McpClient
): PublicAgentFeatureSection[] {
	const kanbanChannelSection = channel.featureSections[CHANNEL_COMPOSE_FEATURE_INDEX];
	const analyticsChannelSection = findDirectoryAnalyticsSection(channel.featureSections);

	const minimalSetupCopy = buildDirectoryAgentChannelMinimalSetupFeatureCopy({
		assistantLabel,
		platformLabel: channel.platformLabel,
		channelSlug: channel.slug
	});
	const connectOnceCopy =
		mode === 'agent-host'
			? buildDirectoryAgentChannelConnectOnceFeatureCopy({
					assistantLabel,
					platformLabel: channel.platformLabel,
					channelSlug: channel.slug
				})
			: undefined;

	return sections
		.filter((section) => section.subtitle !== SCALE_SECTION_SUBTITLE)
		.map((section) => {
			if (section.subtitle === DIRECTORY_AGENT_CONNECT_ONCE_SUBTITLE && connectOnceCopy) {
				return {
					...section,
					title: connectOnceCopy.title,
					description: connectOnceCopy.description,
					cliCommandsTitle: 'Directory CLI options',
					cliCommands: channelConfig.kanbanCliCommands
				};
			}

			if (section.subtitle === DIRECTORY_AGENT_MINIMAL_SETUP_SUBTITLE) {
				return {
					...section,
					title: minimalSetupCopy.title,
					description: minimalSetupCopy.description,
					cliCommandsTitle: mode === 'mcp-client' ? 'First prompt to try' : section.cliCommandsTitle,
					cliCommands: minimalSetupCopy.cliCommands,
					...(mode === 'mcp-client' && mcpClient
						? {
								parallelMocks: buildDirectoryAgentChannelMinimalSetupParallelMocks(
									mcpClient,
									assistantLabel
								),
								imageAlt: `Connect OpenQuok MCP to ${assistantLabel} for directory launch prep`
							}
						: {})
				};
			}

			if (section.subtitle === KANBAN_SECTION_SUBTITLE) {
				return mergeChannelFeatureIntoAgentSection(section, kanbanChannelSection, {
					cliCommandsTitle: mode === 'mcp-client' ? 'Example prompts' : section.cliCommandsTitle,
					cliCommands:
						mode === 'mcp-client' ? channelConfig.kanbanMcpPrompts : channelConfig.kanbanCliCommands
				});
			}

			if (section.subtitle === ANALYTICS_SECTION_SUBTITLE) {
				return mergeChannelFeatureIntoAgentSection(section, analyticsChannelSection, {
					cliCommandsTitle: mode === 'mcp-client' ? 'Example prompts' : section.cliCommandsTitle,
					cliCommands:
						mode === 'mcp-client'
							? channelConfig.analyticsMcpPrompts
							: channelConfig.analyticsCliCommands
				});
			}

			return section;
		});
}

export function customizeAgentsChannelFeatureSections(
	sections: PublicAgentFeatureSection[],
	channel: PublicChannelLandingPageViewModel,
	channelConfig: PublicAgentChannelPageConfig,
	mode: 'agent-host' | 'mcp-client',
	assistantLabel: string,
	mcpClient?: McpClient
): PublicAgentFeatureSection[] {
	if (isPublicDirectoryChannel(channel)) {
		return customizeDirectoryAgentsChannelFeatureSections(
			sections,
			channel,
			channelConfig,
			mode,
			assistantLabel,
			mcpClient
		);
	}

	const composeSection = channel.featureSections[CHANNEL_COMPOSE_FEATURE_INDEX];
	const supportsAnalytics = channelProviderIdentifiersSupportAnalytics(
		channelConfig.providerIdentifiers
	);
	const analyticsSlotChannelSection = findChannelFeatureForAnalyticsSlot(
		channel.featureSections,
		supportsAnalytics
	);

	const customized = sections.map((section) => {
		if (section.subtitle === KANBAN_SECTION_SUBTITLE) {
			return mergeChannelFeatureIntoAgentSection(section, composeSection, {
				cliCommandsTitle: mode === 'mcp-client' ? 'Example prompts' : section.cliCommandsTitle,
				cliCommands: mode === 'mcp-client' ? channelConfig.kanbanMcpPrompts : channelConfig.kanbanCliCommands
			});
		}

		if (section.subtitle === ANALYTICS_SECTION_SUBTITLE) {
			return mergeChannelFeatureIntoAgentSection(section, analyticsSlotChannelSection, {
				cliCommandsTitle: mode === 'mcp-client' ? 'Example prompts' : section.cliCommandsTitle,
				cliCommands:
					mode === 'mcp-client' ? channelConfig.analyticsMcpPrompts : channelConfig.analyticsCliCommands
			});
		}

		return section;
	});

	if (supportsAnalytics) {
		return customized;
	}

	return customized.filter((section) => section.subtitle !== SCALE_SECTION_SUBTITLE);
}
