import type { IconName } from '$data/icons';

import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBentoConfig';
import type { OpenquokCliCommandReferenceItem } from '$lib/content/constants/openquokCliCommandReference';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';

export type PublicAgentChannelPageConfig = {
	/** URL segment under `/agents/{agentSlug}/` — matches channel catalog `slug`. */
	channelSlug: string;
	platformLabel: string;
	icon: IconName;
	/** Listing tag slug for playbooks and building blocks preview filters. */
	listingTagSlug: string;
	providerIdentifiers: readonly string[];
	kanbanBentoId: PublicChannelFeatureBentoId;
	analyticsBentoId: PublicChannelFeatureBentoId;
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	cliExamplesPath: string;
	commands: readonly OpenquokCliCommandReferenceItem[];
	kanbanCliCommands: string;
	analyticsCliCommands: string;
	kanbanMcpPrompts: string;
	analyticsMcpPrompts: string;
};

export type PublicAgentChannelHubLinkViewModel = {
	slug: string;
	platformLabel: string;
	icon: IconName;
	href: string;
	description: string;
};

export type PublicAgentChannelHostConfig = {
	slug: string;
	agentLabel: string;
	metaTitle: (platformLabel: string) => string;
	metaDescription: (platformLabel: string) => string;
	extraKeywords: (platformLabel: string) => readonly string[];
};

export type PublicAgentChannelHostRegistry = {
	host: PublicAgentChannelHostConfig;
	buildChannelConfigs: () => PublicAgentChannelPageConfig[];
};
