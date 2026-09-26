import type { Offer, WebPage } from 'schema-dts';
import type { SubscriptionPeriod } from 'openquok-common';

import { GetPublicPricingPresenter } from '$lib/billing';
import { PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG } from '$lib/content/constants/publicSelfHostingLandingConfig';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type CreatePublicPricingOffersParams = {
	pageUrl: string;
	origin?: string;
	period?: SubscriptionPeriod;
	includeSelfHost?: boolean;
};

function resolveCanonicalUrl(pageUrl: string): string {
	return pageUrl.replace(/#.*$/, '');
}

function resolveAbsoluteUrl(href: string, origin?: string): string {
	if (/^https?:\/\//i.test(href)) {
		return href;
	}
	if (origin) {
		return new URL(href, origin).href;
	}
	return href;
}

/** $0 self-host offer aligned with `PublicSelfHostPricingFootnote.svelte` copy. */
export function createPublicSelfHostPricingOffer(params: {
	pageUrl: string;
	origin?: string;
}): Offer {
	const selfHostLink =
		PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.links.find(
			(link) => link.id === 'self-hosting-overview'
		) ?? PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.links.at(-1);

	return {
		'@type': 'Offer',
		name: PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.headline,
		description: PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.body,
		price: '0',
		priceCurrency: 'USD',
		url: resolveAbsoluteUrl(selfHostLink?.href ?? publicFaqHref.selfHostingLanding, params.origin),
		availability: 'https://schema.org/InStock',
		category: 'self-host'
	};
}

/** Paid subscription tiers from `GetPublicPricingPresenter` (monthly prices by default). */
export function createPublicPaidPlanOffers(params: {
	pageUrl: string;
	period?: SubscriptionPeriod;
}): Offer[] {
	const presenter = new GetPublicPricingPresenter();
	const period = params.period ?? 'MONTHLY';
	const pageVm = presenter.buildPageVm(period);
	const canonical = resolveCanonicalUrl(params.pageUrl);

	return pageVm.plans.map((plan) => ({
		'@type': 'Offer',
		name: plan.name,
		description: plan.tagline,
		category: 'subscription',
		priceCurrency: 'USD',
		price: period === 'YEARLY' ? plan.yearPrice : plan.monthPrice,
		url: canonical
	}));
}

export function createPublicPricingOffers(params: CreatePublicPricingOffersParams): Offer[] {
	const { includeSelfHost = true, ...rest } = params;
	const paidOffers = createPublicPaidPlanOffers(rest);

	if (!includeSelfHost) {
		return paidOffers;
	}

	return [...paidOffers, createPublicSelfHostPricingOffer(rest)];
}

/**
 * JSON-LD pricing section node at `{canonical}#pricing` for landing pages that render
 * `PublicMarketingPricingSection` (home, API marketing hubs/platforms).
 */
export function createPublicPricingSectionSEOSchema(
	params: CreatePublicPricingOffersParams & { fragmentId?: string; pageName?: string }
): WebPage | Record<string, never> {
	const { fragmentId = 'pricing', pageName = 'Pricing', ...offerParams } = params;
	const canonical = resolveCanonicalUrl(offerParams.pageUrl);
	const offers = createPublicPricingOffers({ ...offerParams, pageUrl: canonical });

	if (offers.length === 0) {
		return {};
	}

	return {
		'@type': 'WebPage',
		'@id': `${canonical}#${fragmentId}`,
		name: pageName,
		url: `${canonical}#${fragmentId}`,
		offers
	};
}
