import {
	listPublicAgentsForHub,
	type PublicAgentHostLandingPage
} from '$lib/content/constants/publicAgentConfig';
import {
	listPublicMcpIntegrationsForHub,
	type PublicMcpIntegration
} from '$lib/content/constants/publicMcpConfig';

export class PublicAgentsPagePresenter {
	public agentsViewModel: PublicAgentHostLandingPage[] = $state([]);
	public mcpIntegrationsViewModel: PublicMcpIntegration[] = $state([]);

	/** Stateless — safe for `+page.server.ts` (SSR): hub catalog → VM without mutating `$state`. */
	loadAgentsHubStateless(): PublicAgentHostLandingPage[] {
		return listPublicAgentsForHub();
	}

	/** Stateful wrapper — calls {@link loadAgentsHubStateless} and assigns {@link agentsViewModel}. */
	loadAgentsHub(): PublicAgentHostLandingPage[] {
		const agentsViewModel = this.loadAgentsHubStateless();
		this.agentsViewModel = agentsViewModel;
		return agentsViewModel;
	}

	/** Stateless — safe for `+page.server.ts` (SSR): MCP hub catalog → VM without mutating `$state`. */
	loadMcpIntegrationsHubStateless(): PublicMcpIntegration[] {
		return listPublicMcpIntegrationsForHub();
	}

	/** Stateful wrapper — calls {@link loadMcpIntegrationsHubStateless} and assigns {@link mcpIntegrationsViewModel}. */
	loadMcpIntegrationsHub(): PublicMcpIntegration[] {
		const mcpIntegrationsViewModel = this.loadMcpIntegrationsHubStateless();
		this.mcpIntegrationsViewModel = mcpIntegrationsViewModel;
		return mcpIntegrationsViewModel;
	}
}
