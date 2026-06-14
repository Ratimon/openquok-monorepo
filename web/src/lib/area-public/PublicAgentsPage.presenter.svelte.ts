import {
	listPublicAgentsForHub,
	type PublicAgentLandingPage
} from '$lib/content/constants/publicAgentConfig';

import type { PublicAgentViewModel } from '$lib/area-public/PublicAgentByPage.presenter.svelte';

export type { PublicAgentViewModel };

export class PublicAgentsPagePresenter {
	public agentsVm: PublicAgentViewModel[] = $state([]);

	/** Stateless — safe for `+page.server.ts` (SSR): hub catalog → VM without mutating `$state`. */
	loadAgentsHubStateless(): PublicAgentViewModel[] {
		return listPublicAgentsForHub().map(toPublicAgentVm);
	}

	/** Stateful wrapper — calls {@link loadAgentsHubStateless} and assigns {@link agentsVm}. */
	loadAgentsHub(): PublicAgentViewModel[] {
		const agentsVm = this.loadAgentsHubStateless();
		this.agentsVm = agentsVm;
		return agentsVm;
	}
}

function toPublicAgentVm(page: PublicAgentLandingPage): PublicAgentViewModel {
	return page;
}
