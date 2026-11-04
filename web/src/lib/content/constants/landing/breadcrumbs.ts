/** Labels for public marketing landing-page breadcrumbs (rendered uppercase in UI). */
export const PUBLIC_LANDING_BREADCRUMB = {
	agentsHub: 'Agents',
	autonomousAgentIntegrations: 'Autonomous Agent Integrations',
	mcpIntegrations: 'MCP Integrations',
	alternativesHub: 'Alternatives',
	compareHub: 'Compare',
	selfHosting: 'Self-Hosting',
	pricing: 'Pricing',
	roadmap: 'Roadmap',
	supportedChannels: 'Supported Channels',
	playbooksHub: 'Playbooks',
	buildingBlocksHub: 'Building Blocks',
	buildBacklinksHub: 'Build backlinks',
	directorySubmissionTool: 'Directory submission tool',
	browserExtension: 'Browser extension',
	socialAutopilotLanding: 'Social media management',
	categories: 'Categories',
	tags: 'Tags'
} as const;

/** Scroll targets on `/agents` for integration-hub breadcrumb links. */
export const PUBLIC_AGENTS_HUB_SECTION_IDS = {
	autonomousAgentIntegrations: 'public-autonomous-agent-hub-heading',
	mcpIntegrations: 'public-mcp-hub-heading'
} as const;

export type PublicAgentsHubSectionId =
	(typeof PUBLIC_AGENTS_HUB_SECTION_IDS)[keyof typeof PUBLIC_AGENTS_HUB_SECTION_IDS];

/** Scroll targets on `/channels` for hub section breadcrumb links. */
export const PUBLIC_CHANNELS_HUB_SECTION_IDS = {
	socialMediaPlatforms: 'public-social-channels-hub-heading',
	directoryLaunchPlatforms: 'public-directory-channels-hub-heading'
} as const;

export type PublicChannelsHubSectionId =
	(typeof PUBLIC_CHANNELS_HUB_SECTION_IDS)[keyof typeof PUBLIC_CHANNELS_HUB_SECTION_IDS];

/** Scroll targets on `/compare` for hub section headings. */
export const PUBLIC_COMPARE_HUB_SECTION_IDS = {
	socialMediaSchedulers: 'public-compare-social-schedulers-heading',
	directorySubmissionServices: 'public-compare-directory-submission-heading'
} as const;

export type PublicCompareHubSectionId =
	(typeof PUBLIC_COMPARE_HUB_SECTION_IDS)[keyof typeof PUBLIC_COMPARE_HUB_SECTION_IDS];
