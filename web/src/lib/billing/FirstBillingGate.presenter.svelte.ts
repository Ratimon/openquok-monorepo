import type { BillingPricingViewModel, GetBillingPresenter } from '$lib/billing/GetBilling.presenter.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

/**
 * Evaluates whether a free-tier workspace should see the first-billing gate
 * instead of the normal protected app shell.
 */
export class FirstBillingGatePresenter {
	loading = $state(true);
	restrictFreeUser = $state(false);
	pricingVm = $state<BillingPricingViewModel | null>(null);

	constructor(
		private readonly getBillingPresenter: GetBillingPresenter,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	async evaluate(): Promise<void> {
		this.loading = true;
		try {
			if (!this.workspaceSettingsPresenter.currentWorkspaceId) {
				await this.workspaceSettingsPresenter.load({ includeTeam: false });
			}
			const organizationId = this.workspaceSettingsPresenter.currentWorkspaceId ?? undefined;
			const pricingVm =
				await this.getBillingPresenter.loadBillingPricingVmStateless(organizationId);
			this.pricingVm = pricingVm;

			const tier = pricingVm.currentVm?.tier ?? 'FREE';
			const hasActiveSubscription =
				Boolean(pricingVm.currentVm?.subscription?.id) ||
				(tier !== 'FREE' && tier !== null);

			this.restrictFreeUser =
				pricingVm.billingEnabled && !hasActiveSubscription && tier === 'FREE';
		} finally {
			this.loading = false;
		}
	}
}
