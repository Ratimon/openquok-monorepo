/** Labels for public marketing landing-page breadcrumbs (rendered uppercase in UI). */
export const PUBLIC_LANDING_BREADCRUMB = {
	agentsHub: 'Agents',
	autonomousAgentIntegrations: 'Autonomous Agent Integrations',
	mcpIntegrations: 'MCP Integrations',
	supportedChannels: 'Supported Channels'
} as const;

/** Scroll targets on `/agents` for integration-hub breadcrumb links. */
export const PUBLIC_AGENTS_HUB_SECTION_IDS = {
	autonomousAgentIntegrations: 'public-autonomous-agent-hub-heading',
	mcpIntegrations: 'public-mcp-hub-heading'
} as const;

export type PublicAgentsHubSectionId =
	(typeof PUBLIC_AGENTS_HUB_SECTION_IDS)[keyof typeof PUBLIC_AGENTS_HUB_SECTION_IDS];
