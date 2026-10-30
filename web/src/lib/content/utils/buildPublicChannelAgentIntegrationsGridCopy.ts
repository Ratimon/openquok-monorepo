import { getChannelPageEcosystemId } from '$lib/content/constants/agents/ecosystems';

export function buildPublicChannelAgentIntegrationsGridSubtitle(): string {
	return 'Agents & MCP integrations';
}

/** Title for `FeaturesSectionHeader` — newline-separated to avoid comma wrap artifacts with highlight chips. */
export function buildPublicChannelAgentIntegrationsGridTitle(
	platformLabel: string,
	channelSlug?: string
): string {
	const label = platformLabel.trim();
	const slug = channelSlug?.trim().toLowerCase() ?? '';
	const ecosystemId = slug ? getChannelPageEcosystemId(slug) : undefined;

	if (label.length > 0) {
		if (ecosystemId === 'xai-grok') {
			return `Schedule ${label} from Grok Bot\nCursor MCP and every agent host`;
		}
		if (ecosystemId === 'meta-consumer') {
			return `Schedule ${label} from Meta Muse\nOpenClaw and every agent host`;
		}
		return `Schedule ${label} from OpenClaw\nGrok Bot and every agent host`;
	}
	return 'Schedule from OpenClaw\nGrok Bot and every agent host';
}

export function buildPublicChannelAgentIntegrationsGridDescription(
	platformLabel: string,
	channelSlug?: string
): string {
	const label = platformLabel.trim();
	const slug = channelSlug?.trim().toLowerCase() ?? '';
	const ecosystemId = slug ? getChannelPageEcosystemId(slug) : undefined;

	if (label.length > 0) {
		if (ecosystemId === 'xai-grok') {
			return `Each agent page covers Grok Bot, Cursor, and other MCP clients. Find ${label} workflows for xAI's cloud desktop, openquok-core CLI examples, and FAQs.`;
		}
		if (ecosystemId === 'meta-consumer') {
			return `Each agent page covers Meta Muse, Muse Code, and other hosts for ${label}. Find Meta-first workflows, CLI examples, and FAQs. OpenClaw, Cursor, and ChatGPT MCP are also listed.`;
		}
		return `Each agent host and MCP client has its own page. Find ${label} workflows, openquok-core CLI examples, and FAQs for Cursor, ChatGPT, Claude Code, and more.`;
	}
	return 'Each agent host and MCP client has its own page. Find platform workflows, CLI examples, and FAQs.';
}

export function buildPublicChannelAgentIntegrationsGridCoreLabel(): string {
	return 'Autonomous agents';
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
