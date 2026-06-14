import {
	getAvailablePublicAgentBySlug,
	type PublicAgentLandingPage
} from '$lib/content/constants/publicAgentConfig';

export type PublicAgentViewModel = PublicAgentLandingPage;

export class PublicAgentByPagePresenter {
	public agentVm: PublicAgentViewModel | null = $state(null);

	readonly secondaryCtaText = 'Get Started For Free';
	readonly secondaryCtaHref = '/pricing';

	/**
	 * Stateless — safe for `+page.server.ts` (SSR): resolve slug → VM without mutating `$state`.
	 * Returns `null` when the slug is missing or the agent is not available.
	 */
	loadAgentBySlugStateless(slug: string): PublicAgentViewModel | null {
		const agent = getAvailablePublicAgentBySlug(slug);
		return agent ? toPublicAgentVm(agent) : null;
	}

	/** Stateful wrapper — calls {@link loadAgentBySlugStateless} and assigns {@link agentVm}. */
	loadAgentBySlug(slug: string): PublicAgentViewModel | null {
		const agentVm = this.loadAgentBySlugStateless(slug);
		this.agentVm = agentVm;
		return agentVm;
	}
}

function toPublicAgentVm(page: PublicAgentLandingPage): PublicAgentViewModel {
	return page;
}
