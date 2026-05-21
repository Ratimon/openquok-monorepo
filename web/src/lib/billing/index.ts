import { httpGateway } from '$lib/core/index';
import type { BillingConfig } from '$lib/billing/Billing.repository.svelte';
import { BillingRepository } from '$lib/billing/Billing.repository.svelte';
import { BillingPresenter } from '$lib/billing/Billing.presenter.svelte';

const billingConfig: BillingConfig = {
	endpoints: {
		plans: '/api/v1/billing/plans',
		current: '/api/v1/billing/current',
		root: '/api/v1/billing',
		subscribe: '/api/v1/billing/subscribe',
		portal: '/api/v1/billing/portal',
		checkCheckout: (id) => `/api/v1/billing/check/${encodeURIComponent(id)}`
	}
};

export const billingRepository = new BillingRepository(httpGateway, billingConfig);
export const billingPresenter = new BillingPresenter(billingRepository);

export { BillingPresenter } from '$lib/billing/Billing.presenter.svelte';
export {
	formatPostsPerMonthLimit,
	type BillingCurrentDto,
	type BillingPlanDto
} from '$lib/billing/Billing.repository.svelte';
export { stripePriceIdForTier, STRIPE_PUBLISHABLE_KEY } from '$lib/billing/constants/config';
