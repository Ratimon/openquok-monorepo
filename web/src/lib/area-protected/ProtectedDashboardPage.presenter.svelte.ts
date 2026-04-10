import type { ConnectedIntegrationProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';
import type { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import { toast } from '$lib/ui/sonner';

export type DashboardIntegrationsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Account dashboard: workspace channels list and post-OAuth landing feedback (`?added=&msg=&onboarding=`).
 */
export class ProtectedDashboardPagePresenter {
	connectedIntegrations = $state<ConnectedIntegrationProgrammerModel[]>([]);
	listStatus = $state<DashboardIntegrationsLoadStatus>('idle');
    // to do : add on board
	showOnboardingWelcome = $state(true);

	constructor(
		private readonly integrationsRepository: IntegrationsRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	sortedIntegrations = $derived.by(() =>
		[...this.connectedIntegrations].sort((a, b) =>
			(a.name || a.identifier || '').localeCompare(b.name || b.identifier || '', undefined, {
				sensitivity: 'base'
			})
		)
	);

	async loadConnectedIntegrations(): Promise<void> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			this.connectedIntegrations = [];
			this.listStatus = 'idle';
			return;
		}
		this.listStatus = 'loading';
		try {
			this.connectedIntegrations = await this.integrationsRepository.listConnectedIntegrations(orgId);
			this.listStatus = 'ready';
		} catch {
			this.listStatus = 'error';
			this.connectedIntegrations = [];
		}
	}

	dismissOnboardingWelcome(): void {
		this.showOnboardingWelcome = false;
	}

	/**
	 * One-shot handler after social connect redirect: optional toast from `msg`, onboarding dialog, strip query from URL.
	 * Default success copy is shown from the continue-integration flow before navigation; `added` alone only drives list refresh / onboarding.
	 */
	async handlePostConnectQuery(
		url: URL,
		navigate: (href: string, opts?: { replaceState?: boolean }) => Promise<void>
	): Promise<void> {
		const added = url.searchParams.get('added');
		const msg = url.searchParams.get('msg');
		const onboarding = url.searchParams.get('onboarding');
		if (!added && !msg && onboarding !== 'true') return;

		if (msg) {
			try {
				toast.success(decodeURIComponent(msg.replace(/\+/g, ' ')));
			} catch {
				toast.success(msg.replace(/\+/g, ' '));
			}
		}

		if (onboarding === 'true') {
			this.showOnboardingWelcome = true;
		}

		await navigate(url.pathname, { replaceState: true });
		await this.loadConnectedIntegrations();
	}
}
