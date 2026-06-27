import {
	listPublicAgentsForHub,
	type PublicAgentHostLandingPageViewModel
} from '$lib/content/constants/publicAgentConfig';
import {
	listPublicMcpIntegrationsForHub,
	type PublicMcpIntegrationViewModel
} from '$lib/content/constants/publicMcpConfig';

export class PublicAgentsPagePresenter {
	public agentsVm: PublicAgentHostLandingPageViewModel[] = $state([]);
	public mcpIntegrationsVm: PublicMcpIntegrationViewModel[] = $state([]);

	/** Stateless — safe for `+page.server.ts` (SSR): hub catalog → VM without mutating `$state`. */
	loadAgentsHubStateless(): PublicAgentHostLandingPageViewModel[] {
		return listPublicAgentsForHub();
	}

	/** Stateful wrapper — calls {@link loadAgentsHubStateless} and assigns {@link agentsViewModel}. */
	loadAgentsHub(): PublicAgentHostLandingPageViewModel[] {
		const agentsVm = this.loadAgentsHubStateless();
		this.agentsVm = agentsVm;
		return agentsVm;
	}

	/** Stateless — safe for `+page.server.ts` (SSR): MCP hub catalog → VM without mutating `$state`. */
	loadMcpIntegrationsHubStateless(): PublicMcpIntegrationViewModel[] {
		return listPublicMcpIntegrationsForHub();
	}

	/** Stateful wrapper — calls {@link loadMcpIntegrationsHubStateless} and assigns {@link mcpIntegrationsViewModel}. */
	loadMcpIntegrationsHub(): PublicMcpIntegrationViewModel[] {
		const mcpIntegrationsVm = this.loadMcpIntegrationsHubStateless();
		this.mcpIntegrationsVm = mcpIntegrationsVm;
		return mcpIntegrationsVm;
	}
}
