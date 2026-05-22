import { httpGateway } from '$lib/core/index';
import type { BillingConfig } from '$lib/billing/Billing.repository.svelte';
import { BillingRepository } from '$lib/billing/Billing.repository.svelte';
import { BillingPresenter } from '$lib/billing/Billing.presenter.svelte';
import { GetPricingPresenter } from '$lib/billing/GetPricing.presenter.svelte';
import { workspaceSettingsPresenter } from '$lib/settings';

const billingConfig: BillingConfig = {
	endpoints: {
		plans: '/api/v1/billing/plans',
		current: '/api/v1/billing/current',
		root: '/api/v1/billing',
		subscribe: '/api/v1/billing/subscribe',
		embedded: '/api/v1/billing/embedded',
		portal: '/api/v1/billing/portal',
		checkCheckout: (id) => `/api/v1/billing/check/${encodeURIComponent(id)}`,
		checkDiscount: '/api/v1/billing/check-discount',
		applyDiscount: '/api/v1/billing/apply-discount',
		finishTrial: '/api/v1/billing/finish-trial',
		isTrialFinished: '/api/v1/billing/is-trial-finished',
		prorate: '/api/v1/billing/prorate',
		cancel: '/api/v1/billing/cancel'
	}
};

export const billingRepository = new BillingRepository(httpGateway, billingConfig);

export const getPricingPresenter = new GetPricingPresenter(billingRepository);

export const billingPresenter = new BillingPresenter(billingRepository, workspaceSettingsPresenter);

export { BillingPresenter } from '$lib/billing/Billing.presenter.svelte';
export {
	GetPricingPresenter,
	buildPlanFeatureLines,
	tierDisplayName,
	type BillingCurrentViewModel,
	type BillingPlanViewModel,
	type BillingPricingViewModel,
	type BillingSubscriptionViewModel,
	type PlanFeatureLineViewModel
} from '$lib/billing/GetPricing.presenter.svelte';
export {
	formatPostsPerMonthLimit,
	type BillingCurrentProgrammerModel,
	type BillingPlanProgrammerModel,
	type BillingSubscriptionProgrammerModel,
	type ListBillingPlansProgrammerModel
} from '$lib/billing/Billing.repository.svelte';
export { stripePriceIdForTier, STRIPE_PUBLISHABLE_KEY } from '$lib/billing/constants/config';
