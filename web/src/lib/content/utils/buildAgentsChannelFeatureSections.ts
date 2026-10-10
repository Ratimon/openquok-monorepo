import type { PublicAgentChannelPageConfig } from '$lib/content/constants/agents/channels';
import type { PublicAgentFeatureSection } from '$lib/content/constants/agents';
import { CHANNEL_INSIGHTS_BENTO_SUFFIX } from '$lib/content/constants/channels/catalog/shared';
import type {
	PublicChannelFeatureSection,
	PublicChannelLandingPageViewModel
} from '$lib/content/constants/channels';
import { channelProviderIdentifiersSupportAnalytics } from '$data/social-providers';

const KANBAN_SECTION_SUBTITLE = 'Kanban + smart filters';
const ANALYTICS_SECTION_SUBTITLE = 'Analytics';
const SCALE_SECTION_SUBTITLE = 'Scale what works';

/**
 * Compose/settings row on `/channels/{slug}` — reused for the agent channel
 * "Kanban + smart filters" slot (platform-specific bento + copy).
 */
const CHANNEL_COMPOSE_FEATURE_INDEX = 1;

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
export function customizeAgentsChannelFeatureSections(
	sections: PublicAgentFeatureSection[],
	channel: PublicChannelLandingPageViewModel,
	channelConfig: PublicAgentChannelPageConfig,
	mode: 'agent-host' | 'mcp-client'
): PublicAgentFeatureSection[] {
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
