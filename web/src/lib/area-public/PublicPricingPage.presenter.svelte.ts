import type { GetPublicPricingPresenter, PublicPricingPageViewModel } from '$lib/billing/GetPublicPricing.presenter.svelte';
import type { SubscriptionPeriod } from 'openquok-common';

export class PublicPricingPagePresenter {
	billingPeriod = $state<SubscriptionPeriod>('MONTHLY');

	constructor(private readonly getPublicPricingPresenter: GetPublicPricingPresenter) {}

	get pageVm(): PublicPricingPageViewModel {
		return this.getPublicPricingPresenter.buildPageVm(this.billingPeriod);
	}

	setBillingPeriod(period: SubscriptionPeriod): void {
		this.billingPeriod = period;
	}
}
