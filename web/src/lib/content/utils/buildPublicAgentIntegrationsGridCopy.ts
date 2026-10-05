import { getAgentHostEcosystemId } from '$lib/content/constants/agents/ecosystems';

export function buildPublicAgentIntegrationsGridSubtitle(): string {
	return 'Autonomous agents & MCP';
}

/** Colon-separated title — avoids stray commas when highlight segments wrap. */
export function buildPublicAgentIntegrationsGridTitle(agentLabel: string): string {
	const agent = agentLabel.trim();
	if (agent.length > 0) {
		return `Beyond ${agent}: Every Supported Agent`;
	}
	return 'Beyond this integration: Every Supported Agent';
}

export function buildPublicAgentIntegrationsGridDescription(
	agentLabel: string,
	hostSlug?: string | null
): string {
	const agent = agentLabel.trim();
	const ecosystemId = hostSlug?.trim() ? getAgentHostEcosystemId(hostSlug) : undefined;

	if (ecosystemId === 'openai-personal-agents' && agent.length > 0) {
		return `Open another autonomous agent or MCP client landing page. Dots and OpenClaw stay pinned first so you can compare OpenAI-aligned hosts beside ${agent}.`;
	}

	if (ecosystemId === 'meta-consumer' && agent.length > 0) {
		return `Open another autonomous agent or MCP client landing page. Compare setup steps, Meta-first channels, and scheduling workflows beside ${agent}.`;
	}

	if (ecosystemId === 'xai-grok' && agent.length > 0) {
		return `Open another autonomous agent or MCP client landing page. Compare xAI Grok Bot workflows, X-first channels, and other hosts beside ${agent}.`;
	}

	if (agent.length > 0) {
		return `Open the landing page for another autonomous agent or MCP client. Compare setup steps, supported channels, and scheduling workflows beside ${agent}.`;
	}
	return 'Open the landing page for another autonomous agent or MCP client. Compare setup steps and scheduling workflows.';
}

export function buildPublicAgentIntegrationsGridCoreLabel(): string {
	return 'Autonomous agents';
}

export function buildPublicAgentIntegrationsGridExtensionLabel(): string {
	return 'MCP clients';
}

export function buildPublicAgentIntegrationHubCardDescription(
	agentLabel: string,
	kind: 'agent-host' | 'mcp-client',
	available: boolean
): string {
	const agent = agentLabel.trim();
	if (!available) {
		return agent.length > 0
			? `Preview ${agent} scheduling workflows — coming soon.`
			: 'Integration preview — coming soon.';
	}

	if (kind === 'mcp-client') {
		return agent.length > 0
			? `Schedule every supported channel with MCP tools from ${agent}.`
			: 'Schedule every supported channel with MCP tools.';
	}

	return agent.length > 0
		? `Schedule every supported channel from ${agent} with openquok-core.`
		: 'Schedule every supported channel with openquok-core.';
}
