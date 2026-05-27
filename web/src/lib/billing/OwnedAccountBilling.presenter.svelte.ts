import type { GetPricingPresenter } from '$lib/billing/GetPricing.presenter.svelte';
import type { SubscriptionTier } from 'openquok-common';

/**
 * Billing tier and owned-workspace cap for the user's account (organizations they own),
 * independent of the active workspace cookie.
 */
export class OwnedAccountBillingPresenter {
	loading = $state(false);
	loaded = $state(false);
	tier = $state<SubscriptionTier | null>(null);
	workspaceCap = $state<number | null>(null);
	teamMembersPerWorkspace = $state<number | null>(null);

	constructor(private readonly getPricingPresenter: GetPricingPresenter) {}

	async load(): Promise<void> {
		this.loading = true;
		try {
			const vm = await this.getPricingPresenter.loadOwnedAccountBillingVmStateless();
			this.tier = vm?.tier ?? 'FREE';
			this.workspaceCap = vm?.limits.workspaces ?? null;
			this.teamMembersPerWorkspace = vm?.limits.teamMembersPerWorkspace ?? null;
			this.loaded = true;
		} catch {
			this.tier = null;
			this.workspaceCap = null;
			this.teamMembersPerWorkspace = null;
			this.loaded = false;
		} finally {
			this.loading = false;
		}
	}
}
