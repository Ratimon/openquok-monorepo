import type { BillingPresenter } from '$lib/billing/Billing.presenter.svelte';
import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';

import { ConversionTrackEvent, fireProductEvent, trackConversion } from '$lib/product-analytics';
import { authenticationRepository } from '$lib/user-auth/index';

/**
 * Page presenter for account billing: delegates checkout and portal to {@link BillingPresenter}
 * and wires product analytics on subscribe.
 */
export class ProtectedBillingPagePresenter {
	constructor(private readonly billingPresenter: BillingPresenter) {}

	get billing(): BillingPresenter {
		return this.billingPresenter;
	}

	load(): Promise<void> {
		return this.billingPresenter.load();
	}

	pollCheckout(checkoutId: string): Promise<void> {
		return this.billingPresenter.pollCheckout(checkoutId);
	}

	openPortal(): Promise<void> {
		return this.billingPresenter.openPortal();
	}

	reactivateSubscription(): Promise<void> {
		return this.billingPresenter.reactivateSubscription();
	}

	previewProration(tier: PaidSubscriptionTier, period: SubscriptionPeriod): Promise<number> {
		const organizationId = this.billingPresenter.organizationId;
		if (!organizationId) return Promise.resolve(0);
		return this.billingPresenter.previewProration(organizationId, tier, period);
	}

	async subscribeWithTracking(tier: PaidSubscriptionTier, period: SubscriptionPeriod): Promise<void> {
		const plan = this.billingPresenter.plans.find((row) => row.tier === tier);
		const price = plan ? (period === 'MONTHLY' ? plan.monthPrice : plan.yearPrice) : 0;
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
}
