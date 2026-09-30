import type { Offer, PropertyValue, UnitPriceSpecification } from 'schema-dts';

import type {
	ComparePricingPlan,
	ComparePricingUnit,
	CompareProductSlug
} from '$lib/content/constants/competitors/types';
import { getCompareProductWebsiteUrl } from '$lib/content/constants/competitors/index';
import {
	getOpenQuokSoloCompareChannelCount,
	resolveComparePricingDefaultChannelCount,
	scaleComparePlansToChannelTotal
} from '$lib/content/constants/competitors/utils/comparePricing';

export type CompareProductPricingSchemaInput = {
	slug: CompareProductSlug;
	pricingUnit: ComparePricingUnit;
	pricingPlans: ComparePricingPlan[];
};

export type BuildCompareSoftwareApplicationPricingSchemaParams = {
	canonical: string;
	product: CompareProductPricingSchemaInput;
	productASlug: CompareProductSlug;
	productBSlug: CompareProductSlug;
	leftPricingUnit: ComparePricingUnit;
	rightPricingUnit: ComparePricingUnit;
};

/** Baseline channel count used to make flat vs per-channel offers comparable in JSON-LD. */
export function resolveComparePricingSchemaBaselineChannelCount(
	productASlug: CompareProductSlug,
	productBSlug: CompareProductSlug,
	leftPricingUnit: ComparePricingUnit,
	rightPricingUnit: ComparePricingUnit
): number {
	return resolveComparePricingDefaultChannelCount(
		productASlug,
		productBSlug,
		leftPricingUnit,
		rightPricingUnit
	);
}

function formatOfferPrice(amount: number): string {
	return amount.toLocaleString('en-US', { maximumFractionDigits: 2, useGrouping: false });
}

function buildUnitPriceSpecification(
	unit: ComparePricingUnit,
	listUnitPrice: number
): UnitPriceSpecification | undefined {
	if (unit === 'per_channel') {
		return {
			'@type': 'UnitPriceSpecification',
			name: 'Per-channel list rate',
			price: formatOfferPrice(listUnitPrice),
			priceCurrency: 'USD',
			unitText: 'USD per connected social channel per month (list rate before volume tiers)'
		};
	}
	if (unit === 'per_seat') {
		return {
			'@type': 'UnitPriceSpecification',
			name: 'Per-seat list rate',
			price: formatOfferPrice(listUnitPrice),
			priceCurrency: 'USD',
			unitText: 'USD per user seat per month (annual list rate where applicable)'
		};
	}
	return undefined;
}

function offerDescription(plan: ComparePricingPlan, pricingUnit: ComparePricingUnit): string {
	const parts = [
		plan.tagline,
		plan.pricePeriod === 'one_time' ? 'One-time USD license' : undefined,
		plan.footnote
	].filter(Boolean);
	if (pricingUnit === 'per_channel' && plan.monthlyPrice != null && plan.monthlyPrice > 0) {
		parts.push('List rate is per connected channel; Offer price reflects baseline channel count on this compare page.');
	}
	return parts.join(' · ');
}

export function createComparePricingOffers(
	params: BuildCompareSoftwareApplicationPricingSchemaParams
): Offer[] {
	const { product, productASlug, productBSlug, leftPricingUnit, rightPricingUnit, canonical } =
		params;
	const pricingUnit = product.pricingUnit ?? 'flat';
	const baselineChannels = resolveComparePricingSchemaBaselineChannelCount(
		productASlug,
		productBSlug,
		leftPricingUnit,
		rightPricingUnit
	);

	const scaledPlans = scaleComparePlansToChannelTotal(
		product.pricingPlans,
		pricingUnit,
		baselineChannels
	);

	const offerPageUrl = getCompareProductWebsiteUrl(product.slug);

	return product.pricingPlans.flatMap((plan, index) => {
		if (plan.monthlyPrice === null) {
			return [];
		}

		const scaled = scaledPlans[index] ?? plan;
		const displayPrice = scaled.monthlyPrice ?? plan.monthlyPrice;
		const nameSuffix =
			pricingUnit === 'per_channel' && baselineChannels > 1 && plan.monthlyPrice > 0
				? ` (${baselineChannels} channels)`
				: '';

		const unitSpec =
			plan.monthlyPrice > 0 ? buildUnitPriceSpecification(pricingUnit, plan.monthlyPrice) : undefined;

		const offer: Offer = {
			'@type': 'Offer',
			name: `${plan.name}${nameSuffix}`,
			description: offerDescription(scaled, pricingUnit),
			priceCurrency: 'USD',
			price: formatOfferPrice(displayPrice),
			url: offerPageUrl || canonical,
			availability: 'https://schema.org/InStock',
			...(plan.pricePeriod === 'one_time' ? { category: 'one-time-license' } : { category: 'subscription' }),
			...(unitSpec ? { priceSpecification: unitSpec } : {})
		};

		return [offer];
	});
}

/** JSON-LD fragment merged onto compare-page `SoftwareApplication` nodes. */
export type CompareSoftwareApplicationPricingFragment = {
	offers: Offer[];
	additionalProperty?: PropertyValue[];
};

export function createCompareSoftwareApplicationPricingProperties(
	params: BuildCompareSoftwareApplicationPricingSchemaParams
): CompareSoftwareApplicationPricingFragment | Record<string, never> {
	const offers = createComparePricingOffers(params);
	if (offers.length === 0) {
		return {};
	}

	const baselineChannels = resolveComparePricingSchemaBaselineChannelCount(
		params.productASlug,
		params.productBSlug,
		params.leftPricingUnit,
		params.rightPricingUnit
	);

	const additionalProperty: PropertyValue[] | undefined =
		baselineChannels > 1 &&
		(params.leftPricingUnit === 'per_channel' ||
			params.rightPricingUnit === 'per_channel' ||
			params.productASlug === 'openquok' ||
			params.productBSlug === 'openquok')
			? [
					{
						'@type': 'PropertyValue',
						name: 'Compare baseline connected channels',
						value: String(baselineChannels),
						description: `Offer prices for per-channel products use ${baselineChannels} connected channels (OpenQuok Solo bundle baseline).`
					}
				]
			: undefined;

	return {
		offers,
		...(additionalProperty ? { additionalProperty } : {})
	};
}

export { getOpenQuokSoloCompareChannelCount };
