import { isPublicDirectoryChannelSlug } from '$lib/content/constants/channels/catalog/channelCatalogLookup';

const EXTENSION_ASSISTED_SOCIAL_SLUGS = new Set(['reddit', 'skool']);

export function buildBrowserExtensionChannelCrossLinkGridTitle(): string {
	return 'Beyond the extension: Every supported channel';
}

export function buildBrowserExtensionChannelCrossLinkGridDescription(): string {
	return 'OAuth networks connect in the dashboard — the same accounts appear in the side panel. Skool, Reddit, and directory launches add extension connect, autofill, or handoff. Open each channel landing for setup and scheduling FAQs.';
}

export function buildBrowserExtensionChannelCrossLinkCardDescription(
	channelSlug: string,
	platformLabel: string,
	available: boolean
): string {
	const slug = channelSlug.trim().toLowerCase();
	const label = platformLabel.trim() || 'this channel';

	if (!available) {
		return `Preview the ${label} landing — coming soon.`;
	}

	if (isPublicDirectoryChannelSlug(slug)) {
		return `Launch on ${label} with extension autofill from My Products.`;
	}

	if (EXTENSION_ASSISTED_SOCIAL_SLUGS.has(slug)) {
		return `Extension connect or handoff for ${label} — open the channel landing.`;
	}

	return `Connect ${label} in the dashboard, then schedule from the extension side panel.`;
}

export function buildBrowserExtensionAgentIntegrationsGridSubtitle(): string {
	return 'Agents & MCP integrations';
}

/** Newline-separated title for highlight chips in `FeaturesSectionHeader`. */
export function buildBrowserExtensionAgentIntegrationsGridTitle(): string {
	return 'Draft from the extension\nOpenClaw, Grok Bot, and every agent host';
}

export function buildBrowserExtensionAgentIntegrationsGridDescription(): string {
	return 'Each agent host and MCP client has its own page. Find Reddit and Skool workflows, side-panel drafts, openquok-core CLI examples, and FAQs for Cursor, ChatGPT, Claude Code, and more.';
}

export function buildBrowserExtensionAgentIntegrationCardDescription(
	agentLabel: string,
	kind: 'agent-host' | 'mcp-client',
	integrationLive: boolean
): string {
	const agent = agentLabel.trim();
	const agentPhrase = agent.length > 0 ? agent : 'your agent';

	if (!integrationLive) {
		return `Preview extension-assisted workflows for ${agentPhrase} — coming soon.`;
	}

	if (kind === 'mcp-client') {
		return `Draft Reddit and Skool posts with MCP tools from ${agentPhrase}, then use the extension at handoff.`;
	}

	return `Schedule Reddit and Skool from ${agentPhrase} with openquok-core — extension handoff when posts are due.`;
}
