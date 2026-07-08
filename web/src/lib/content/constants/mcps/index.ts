import type { FeaturesOrderedStep } from '$lib/content/constants/agents/types';
import { buildMcpLandingPage, toSkillSetupSteps } from '$lib/content/constants/mcps/builders';
import type { McpLandingSeed, PublicMcpIntegrationViewModel, PublicMcpLandingPageViewModel } from '$lib/content/constants/mcps/types';

import { antigravity_cliMcpSeed } from '$lib/content/constants/mcps/antigravity-cli';
import { codexMcpSeed } from '$lib/content/constants/mcps/codex';
import { cursorMcpSeed } from '$lib/content/constants/mcps/cursor';
import { claude_codeMcpSeed } from '$lib/content/constants/mcps/claude-code';
import { claude_coworkMcpSeed } from '$lib/content/constants/mcps/claude-cowork';
import { vscode_copilotMcpSeed } from '$lib/content/constants/mcps/vscode-copilot';
import { devin_desktopMcpSeed } from '$lib/content/constants/mcps/devin-desktop';
import { ampMcpSeed } from '$lib/content/constants/mcps/amp';
import { warpMcpSeed } from '$lib/content/constants/mcps/warp';

export * from '$lib/content/constants/mcps/types';
export * from '$lib/content/constants/mcps/builders';
export { antigravity_cliMcpSeed } from '$lib/content/constants/mcps/antigravity-cli';
export { codexMcpSeed } from '$lib/content/constants/mcps/codex';
export { cursorMcpSeed } from '$lib/content/constants/mcps/cursor';
export { claude_codeMcpSeed } from '$lib/content/constants/mcps/claude-code';
export { claude_coworkMcpSeed } from '$lib/content/constants/mcps/claude-cowork';
export { vscode_copilotMcpSeed } from '$lib/content/constants/mcps/vscode-copilot';
export { devin_desktopMcpSeed } from '$lib/content/constants/mcps/devin-desktop';
export { ampMcpSeed } from '$lib/content/constants/mcps/amp';
export { warpMcpSeed } from '$lib/content/constants/mcps/warp';

const MCP_LANDING_SEEDS: readonly McpLandingSeed[] = [
	antigravity_cliMcpSeed,
	codexMcpSeed,
	cursorMcpSeed,
	claude_codeMcpSeed,
	claude_coworkMcpSeed,
	vscode_copilotMcpSeed,
	devin_desktopMcpSeed,
	ampMcpSeed,
	warpMcpSeed
];

export const PUBLIC_MCP_LANDING_PAGES: readonly PublicMcpLandingPageViewModel[] =
	MCP_LANDING_SEEDS.map(buildMcpLandingPage);

export type PublicMcpSkillSetupResolveInput = Pick<
	PublicMcpLandingPageViewModel,
	| 'agentLabel'
	| 'mcpClient'
	| 'setupSteps'
	| 'skillSetupSteps'
	| 'skillSetupStepsSubtitle'
	| 'setupStepsSubtitle'
>;

/** Resolves skill setup steps — always rebuilt from MCP install step so config edits apply without stale SSR data. */
export function resolvePublicMcpSkillSetupSteps(
	page: PublicMcpSkillSetupResolveInput
): FeaturesOrderedStep[] {
	const installStep = page.setupSteps?.[0]?.content;
	if (installStep) {
		return toSkillSetupSteps(page.agentLabel, installStep, page.mcpClient);
	}

	return page.skillSetupSteps ?? [];
}

export function resolvePublicMcpSkillSetupStepsTitle(page: PublicMcpSkillSetupResolveInput): string {
	return `Four steps,to ${page.agentLabel} + openquok-core`;
}

export function resolvePublicMcpSkillSetupStepsSubtitle(
	page: PublicMcpSkillSetupResolveInput
): string {
	return page.skillSetupStepsSubtitle ?? page.setupStepsSubtitle ?? 'How it works';
}

const mcpBySlug = new Map(PUBLIC_MCP_LANDING_PAGES.map((page) => [page.slug, page]));

export function getPublicMcpLandingBySlug(slug: string): PublicMcpLandingPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	return mcpBySlug.get(key);
}

export function getAvailablePublicMcpLandingBySlug(slug: string): PublicMcpLandingPageViewModel | undefined {
	const page = getPublicMcpLandingBySlug(slug);
	if (!page?.available) return undefined;
	return page;
}

export function listPublicMcpLandingPages(): PublicMcpLandingPageViewModel[] {
	return [...PUBLIC_MCP_LANDING_PAGES];
}

export function listPublicMcpIntegrationsForHub(): PublicMcpIntegrationViewModel[] {
	return PUBLIC_MCP_LANDING_PAGES.map(
		({ slug, agentLabel, mcpClient, icon, hubDescription }) => ({
			slug,
			label: agentLabel,
			mcpClient,
			icon,
			hubDescription
		})
	);
}
