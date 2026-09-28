import type { FeaturesOrderedStep } from '$lib/content/constants/agents/types';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_AGENTS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
import { buildMcpLandingPage, toSkillSetupSteps } from '$lib/content/constants/mcps/general';
import { MCP_LANDING_SEEDS } from '$lib/content/constants/mcps/seeds';
import type { PublicMcpIntegrationViewModel, PublicMcpLandingPageViewModel } from '$lib/content/constants/mcps/types';

export * from '$lib/content/constants/mcps/types';
export * from '$lib/content/constants/mcps/general';
export { antigravity_cliMcpSeed } from '$lib/content/constants/mcps/hosts/antigravity-cli';
export { chatgptMcpSeed } from '$lib/content/constants/mcps/hosts/chatgpt';
export { codexMcpSeed } from '$lib/content/constants/mcps/hosts/codex';
export { cursorMcpSeed } from '$lib/content/constants/mcps/hosts/cursor';
export { claude_codeMcpSeed } from '$lib/content/constants/mcps/hosts/claude-code';
export { claude_coworkMcpSeed } from '$lib/content/constants/mcps/hosts/claude-cowork';
export { vscode_copilotMcpSeed } from '$lib/content/constants/mcps/hosts/vscode-copilot';
export { devin_desktopMcpSeed } from '$lib/content/constants/mcps/hosts/devin-desktop';
export { ampMcpSeed } from '$lib/content/constants/mcps/hosts/amp';
export { warpMcpSeed } from '$lib/content/constants/mcps/hosts/warp';
export { muse_codeMcpSeed } from '$lib/content/constants/mcps/hosts/muse-code';
export { MCP_LANDING_SEEDS, listPublicMcpLandingSeedsForFooter } from '$lib/content/constants/mcps/seeds';

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

function withMcpLandingGeneralFaqs(
	page: PublicMcpLandingPageViewModel
): PublicMcpLandingPageViewModel {
	return {
		...page,
		faqItems: appendPublicGeneralFaqItems(page.faqItems, PUBLIC_AGENTS_HUB_FAQ_ITEM_IDS)
	};
}

export function getPublicMcpLandingBySlug(slug: string): PublicMcpLandingPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	const page = mcpBySlug.get(key);
	return page ? withMcpLandingGeneralFaqs(page) : undefined;
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
