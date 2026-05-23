import type { BillingPresenter } from '$lib/billing/Billing.presenter.svelte';
import type {
	BillingCurrentViewModel,
	BillingPlanViewModel,
	GetPricingPresenter
} from '$lib/billing/GetPricing.presenter.svelte';
import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

import { ConversionTrackEvent, fireProductEvent, trackConversion } from '$lib/product-analytics';
import { authenticationRepository } from '$lib/user-auth/index';

/**
 * Page presenter for account billing: loads pricing via {@link GetPricingPresenter},
 * delegates checkout and portal to {@link BillingPresenter}, and wires product analytics on subscribe.
 */
export class ProtectedBillingPagePresenter {
	loading = $state(true);
	plansVm = $state<BillingPlanViewModel[]>([]);
	currentVm = $state<BillingCurrentViewModel | null>(null);
	billingEnabled = $state(false);

	private loadInFlight: Promise<void> | null = null;

	constructor(
		private readonly getPricingPresenter: GetPricingPresenter,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		readonly billingPresenter: BillingPresenter
	) {
		this.billingPresenter.bindReloadPricing(() => this.load());
	}

	get organizationId(): string {
		return this.workspaceSettingsPresenter.currentWorkspaceId ?? '';
	}

	async load(): Promise<void> {
		if (this.loadInFlight) {
			return this.loadInFlight;
		}
		this.loadInFlight = this.loadInternal().finally(() => {
			this.loadInFlight = null;
		});
		return this.loadInFlight;
	}

	private async loadInternal(): Promise<void> {
		this.loading = true;
		try {
			const orgId = this.organizationId;
			const pricingVm = await this.getPricingPresenter.loadBillingPricingVmStateless(
				orgId || undefined
			);
			this.plansVm = pricingVm.plansVm;
			this.currentVm = pricingVm.currentVm;
			this.billingEnabled = pricingVm.billingEnabled;
		} finally {
			this.loading = false;
		}
	}

	pollCheckout(checkoutId: string): Promise<boolean> {
		return this.billingPresenter.pollCheckout(checkoutId);
	}

	openPortal(): Promise<void> {
		return this.billingPresenter.openPortal();
	}

	reactivateSubscription(): Promise<void> {
		return this.billingPresenter.reactivateSubscription();
	}

	previewProration(tier: PaidSubscriptionTier, period: SubscriptionPeriod): Promise<number> {
		const organizationId = this.organizationId;
		if (!organizationId) return Promise.resolve(0);
		return this.billingPresenter.previewProration(organizationId, tier, period);
	}

	async subscribeWithTracking(tier: PaidSubscriptionTier, period: SubscriptionPeriod): Promise<void> {
		const planVm = this.plansVm.find((row) => row.tier === tier);
		const price = planVm ? (period === 'MONTHLY' ? planVm.monthPrice : planVm.yearPrice) : 0;
		await trackConversion(ConversionTrackEvent.InitiateCheckout, {
			authenticated: true,
			additional: { value: price }
		});
		await this.billingPresenter.subscribe(tier, period);
	}

	onPurchaseComplete(): void {
		fireProductEvent('purchase', undefined, authenticationRepository.currentUser);
	}

	finishTrial(): Promise<void> {
		return this.billingPresenter.finishTrial();
	}

	pollTrialFinished(): Promise<boolean> {
		return this.billingPresenter.pollTrialFinished();
	}

	checkRetentionOffer(): Promise<boolean> {
		return this.billingPresenter.checkRetentionOffer();
	}

	applyRetentionDiscount(): Promise<boolean> {
		return this.billingPresenter.applyRetentionDiscount();
	}

	cancelWithFeedback(feedback: string): Promise<boolean> {
		return this.billingPresenter.cancelWithFeedback(feedback);
	}
}
