export function buildPublicChannelAgentIntegrationsGridSubtitle(): string {
	return 'Agents & MCP integrations';
}

/** Comma-separated title for `FeaturesSectionHeader` / hero theme segments. */
export function buildPublicChannelAgentIntegrationsGridTitle(platformLabel: string): string {
	const label = platformLabel.trim();
	if (label.length > 0) {
		return `${label} from OpenClaw, from Cursor and Claude Code, every agent landing page`;
	}
	return 'Schedule from OpenClaw, from Cursor and Claude Code, every agent landing page';
}

export function buildPublicChannelAgentIntegrationsGridDescription(platformLabel: string): string {
	const label = platformLabel.trim();
	if (label.length > 0) {
		return `Open a dedicated page for each autonomous agent or MCP client. You get ${label} workflows, CLI or prompt examples, and FAQs for that integration.`;
	}
	return 'Open a dedicated page for each autonomous agent or MCP client. You get platform workflows, CLI or prompt examples, and FAQs for that integration.';
}

export function buildPublicChannelAgentIntegrationsGridExtensionLabel(): string {
	return 'MCP clients';
}

export function buildPublicChannelAgentIntegrationCardDescription(
	platformLabel: string,
	agentLabel: string,
	kind: 'agent-host' | 'mcp-client',
	integrationLive: boolean
): string {
	const platform = platformLabel.trim();
	const agent = agentLabel.trim();
	const platformPhrase = platform.length > 0 ? platform : 'social posts';

	if (!integrationLive) {
		return agent.length > 0
			? `Preview ${platformPhrase} workflows for ${agent} — coming soon.`
			: 'Agent workflows — coming soon.';
	}

	if (kind === 'mcp-client') {
		return agent.length > 0
			? `Draft and schedule ${platformPhrase} with MCP tools from ${agent}.`
			: `Draft and schedule ${platformPhrase} with MCP tools.`;
	}

	return agent.length > 0
		? `Schedule ${platformPhrase} from ${agent} with openquok-core skills and CLI examples.`
		: `Schedule ${platformPhrase} with openquok-core skills and CLI examples.`;
}
