import { getChannelPageEcosystemId } from '$lib/content/constants/agents/ecosystems';

export function buildPublicChannelAgentIntegrationsGridSubtitle(): string {
	return 'Agents & MCP integrations';
}

/** Title for `FeaturesSectionHeader` — colon-separated for gradient-friendly line breaks. */
export function buildPublicChannelAgentIntegrationsGridTitle(
	platformLabel: string,
	channelSlug?: string
): string {
	const label = platformLabel.trim();
	const slug = channelSlug?.trim().toLowerCase() ?? '';
	const ecosystemId = slug ? getChannelPageEcosystemId(slug) : undefined;

	if (label.length > 0) {
		if (ecosystemId === 'xai-grok') {
			return `Schedule ${label} from Grok Bot, Cursor MCP, and every agent host`;
		}
		if (ecosystemId === 'meta-consumer') {
			return `Schedule ${label} from Meta Muse, OpenClaw, and every agent host`;
		}
		return `Schedule ${label} from OpenClaw, Grok Bot, and every agent host`;
	}
	return 'Schedule from OpenClaw, Grok Bot, and every agent host';
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
			return `Open a dedicated landing page for Grok Bot, Cursor, and every other agent or MCP client. You get ${label} workflows on xAI’s cloud desktop, openquok-core CLI examples, and integration FAQs.`;
		}
		if (ecosystemId === 'meta-consumer') {
			return `Open Meta Muse, Muse Code, and every other agent landing for ${label}. You get Meta-first workflows, openquok-core CLI examples, and integration FAQs — plus OpenClaw, Cursor, and ChatGPT MCP.`;
		}
		return `Open a dedicated landing page for each autonomous agent or MCP client. You get ${label} workflows, openquok-core CLI examples, and integration FAQs — including Cursor, ChatGPT, Claude Code, and more.`;
	}
	return 'Open a dedicated landing page for each autonomous agent or MCP client. You get platform workflows, CLI examples, and integration FAQs.';
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
