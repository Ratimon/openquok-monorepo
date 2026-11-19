import type { IconName } from '$data/icons';

import { icons } from '$data/icons';
import { listPublicAgentsForHub } from '$lib/content/constants/agents';
import { listPublicMcpLandingPages } from '$lib/content/constants/mcps';
import { PUBLIC_BROWSER_EXTENSION_STORE_LISTINGS } from '$lib/content/constants/landing/browser-extension-store-listings';

import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';

/** MCP clients highlighted on the pricing compare table (hub order–independent). */
const MCP_SERVER_COMPARE_ICON_SLUGS = [
	'cursor',
	'claude-code',
	'chatgpt',
	'codex',
	'warp',
	'claude-cowork',
	'vscode-copilot',
	'grok-build'
] as const;

/** Agent hosts + MCP clients for the agent integrations row (AdaptlyPost-style mix). */
const AGENT_INTEGRATIONS_MCP_SLUGS = ['cursor', 'claude-code', 'chatgpt', 'codex'] as const;
const AGENT_INTEGRATIONS_HOST_SLUGS = [
	'openclaw',
	'hermes',
	'grok-bot',
	'dots',
	'claude-duet',
	'gemini'
] as const;

const PLUG_CHANNEL_ICONS: readonly IconName[] = [
	icons.Threads.name,
	icons.X.name,
	icons.LinkedIn.name
];

function iconByAgentSlug(slug: string): IconName | undefined {
	return listPublicAgentsForHub().find((page) => page.slug === slug)?.icon;
}

function iconByMcpSlug(slug: string): IconName | undefined {
	return listPublicMcpLandingPages().find((page) => page.slug === slug)?.icon;
}

function iconsForMcpSlugs(slugs: readonly string[]): IconName[] {
	return slugs.map(iconByMcpSlug).filter((icon): icon is IconName => icon != null);
}

function iconsForAgentSlugs(slugs: readonly string[]): IconName[] {
	return slugs.map(iconByAgentSlug).filter((icon): icon is IconName => icon != null);
}

function interleaveAgentAndMcpIcons(
	mcpSlugs: readonly string[],
	agentSlugs: readonly string[],
	maxCount: number
): IconName[] {
	const mcps = iconsForMcpSlugs(mcpSlugs);
	const agents = iconsForAgentSlugs(agentSlugs);
	const merged: IconName[] = [];
	const steps = Math.max(mcps.length, agents.length);
	for (let i = 0; i < steps && merged.length < maxCount; i++) {
		if (i < mcps.length) merged.push(mcps[i]);
		if (merged.length >= maxCount) break;
		if (i < agents.length) merged.push(agents[i]);
	}
	return merged.slice(0, maxCount);
}

const ROW_LABEL_ICON_BUILDERS: Partial<
	Record<PublicPricingCompareRowId, () => readonly IconName[]>
> = {
	mcp_server: () => iconsForMcpSlugs(MCP_SERVER_COMPARE_ICON_SLUGS),
	browser_extension: () =>
		PUBLIC_BROWSER_EXTENSION_STORE_LISTINGS.filter((listing) => listing.available).map(
			(listing) => listing.iconName
		),
	agent_integrations: () => [
		...interleaveAgentAndMcpIcons(AGENT_INTEGRATIONS_MCP_SLUGS, AGENT_INTEGRATIONS_HOST_SLUGS, 7),
		icons.Terminal.name
	],
	internal_plugs: () => [...PLUG_CHANNEL_ICONS]
};

export function publicPricingCompareRowLabelIcons(
	rowId: PublicPricingCompareRowId
): readonly IconName[] | undefined {
	const iconsForRow = ROW_LABEL_ICON_BUILDERS[rowId]?.();
	if (!iconsForRow?.length) return undefined;
	return iconsForRow;
}