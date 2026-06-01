import type { BillingPricingViewModel, GetBillingPresenter } from '$lib/billing/GetBilling.presenter.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

import {
	isCheckoutIdResolved,
	persistResolvedCheckoutId
} from '$lib/billing/utils/resolvedCheckoutIds';

/**
 * Evaluates whether a free-tier workspace should see the first-billing gate
 * instead of the normal protected app shell.
 * Platform admins bypass the gate in `(protected)/+layout.svelte` (`isPlatformAdmin`).
 */
export class FirstBillingGatePresenter {
	loading = $state(true);
	restrictFreeUser = $state(false);
	pricingVm = $state<BillingPricingViewModel | null>(null);
	/** Checkout id already handled this session — avoids `replaceState` (conflicts with PostHog rrweb). */
	resolvedCheckoutId = $state<string | null>(null);
	checkoutReturnInFlightFor = $state<string | null>(null);

	constructor(
		private readonly getBillingPresenter: GetBillingPresenter,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	/** @param blocking When false, refresh billing context without toggling the gate loading shell. */
	async evaluate(options?: { blocking?: boolean }): Promise<void> {
		const blocking = options?.blocking ?? this.pricingVm === null;
		if (blocking) {
			this.loading = true;
		}
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
			if (blocking) {
				this.loading = false;
			}
		}
	}

	/** True while `?checkout=` should bypass the first-billing gate (until marked resolved). */
	isCheckoutBypassed(checkoutId: string | null): boolean {
		if (!checkoutId) return false;
		if (checkoutId === this.resolvedCheckoutId) return false;
		if (isCheckoutIdResolved(checkoutId)) return false;
		return true;
	}

	/** Returns false when this checkout return is already running or finished. */
	tryBeginCheckoutReturn(checkoutId: string): boolean {
		const id = checkoutId.trim();
		if (!id || !this.isCheckoutBypassed(id)) return false;
		if (this.checkoutReturnInFlightFor === id) return false;
		this.checkoutReturnInFlightFor = id;
		return true;
	}

	endCheckoutReturn(): void {
		this.checkoutReturnInFlightFor = null;
	}

	markCheckoutResolved(checkoutId: string): void {
		const id = checkoutId.trim();
		if (!id) return;
		this.resolvedCheckoutId = id;
		persistResolvedCheckoutId(id);
	}
}
