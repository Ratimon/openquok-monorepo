import {
	listPublicAgentsForHub,
	type PublicAgentHostLandingPage
} from '$lib/content/constants/publicAgentConfig';

export class PublicAgentsPagePresenter {
	public agentsVm: PublicAgentHostLandingPage[] = $state([]);

	/** Stateless — safe for `+page.server.ts` (SSR): hub catalog → VM without mutating `$state`. */
	loadAgentsHubStateless(): PublicAgentHostLandingPage[] {
		return listPublicAgentsForHub();
	}

	/** Stateful wrapper — calls {@link loadAgentsHubStateless} and assigns {@link agentsVm}. */
	loadAgentsHub(): PublicAgentHostLandingPage[] {
		const agentsVm = this.loadAgentsHubStateless();
		this.agentsVm = agentsVm;
		return agentsVm;
	}
}
