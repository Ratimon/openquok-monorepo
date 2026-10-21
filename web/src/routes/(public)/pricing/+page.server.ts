import { loadPublicPricingPage } from '$lib/billing/utils/loadPublicPricingPage.server';

export const ssr = true;

export async function load(event) {
	return loadPublicPricingPage({
		...event,
		routeId: 'all',
		redirectLegacyLineQuery: true
	});
}
