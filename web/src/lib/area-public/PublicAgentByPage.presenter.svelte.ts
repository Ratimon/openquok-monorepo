import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/publicAgentConfig';
import {
	getAvailablePublicAgentHostBySlug,
	getPublicAgentHostBySlug
} from '$lib/content/constants/publicAgentConfig';
import type { PublicMcpLandingPageViewModel } from '$lib/content/constants/publicMcpConfig';
import {
	getAvailablePublicMcpLandingBySlug,
	getPublicMcpLandingBySlug,
	listPublicMcpLandingPages
} from '$lib/content/constants/publicMcpConfig';

export type PublicAgentsLandingPage =
	PublicAgentHostLandingPageViewModel | PublicMcpLandingPageViewModel;

export type PublicAgentViewModel = PublicAgentsLandingPage;

export function isPublicMcpLandingPage(
	page: PublicAgentsLandingPage
): page is PublicMcpLandingPageViewModel {
	return page.pageType === 'mcp-client';
}

export function isPublicAgentHostLandingPage(
	page: PublicAgentsLandingPage
): page is PublicAgentHostLandingPageViewModel {
	return page.pageType === 'agent-host';
}

export function getPublicAgentsLandingBySlug(slug: string): PublicAgentsLandingPage | undefined {
	return getPublicAgentHostBySlug(slug) ?? getPublicMcpLandingBySlug(slug);
}

export function getAvailablePublicAgentsLandingBySlug(
	slug: string
): PublicAgentsLandingPage | undefined {
	return getAvailablePublicAgentHostBySlug(slug) ?? getAvailablePublicMcpLandingBySlug(slug);
}

export function listAllPublicAgentsLandingPages(): PublicAgentsLandingPage[] {
	return [...listPublicMcpLandingPages()];
}

export class PublicAgentByPagePresenter {
	public agentVm: PublicAgentViewModel | null = $state(null);

	readonly secondaryCtaText = 'Get Started For Free';
	readonly secondaryCtaHref = '/pricing';

	/**
	 * Stateless — safe for `+page.server.ts` (SSR): resolve slug → VM without mutating `$state`.
	 * Returns `null` when the slug is missing or the agent is not available.
	 */
	loadAgentBySlugStateless(slug: string): PublicAgentViewModel | null {
		const agent = getAvailablePublicAgentsLandingBySlug(slug);
		return agent ?? null;
	}

	/** Stateful wrapper — calls {@link loadAgentBySlugStateless} and assigns {@link agentVm}. */
	loadAgentBySlug(slug: string): PublicAgentViewModel | null {
		const agentVm = this.loadAgentBySlugStateless(slug);
		this.agentVm = agentVm;
		return agentVm;
	}
}
