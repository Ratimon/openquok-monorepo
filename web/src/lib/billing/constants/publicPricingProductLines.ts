import type { PublicPricingCompareRowDefinition } from '$lib/billing/constants/publicPricingCatalog';

/** Product-line filter for pricing marketing (compare table + plan cards). */
export type PublicPricingProductLine = 'all' | 'social' | 'directory';

/** Shown on `/pricing` when a product-line filter is active (same tiers include both lines). */
export const PUBLIC_PRICING_FILTERED_PRODUCT_LINE_FOOTNOTE =
	'All paid plans include Social scheduling and Directory launch on the same workspace.';

/** Which product line a compare row or card bullet belongs to. `shared` rows appear in every filter mode. */
export type PublicPricingFeatureLine = 'social' | 'directory' | 'shared';

export type PublicPricingCardFeatureDefinition = {
	label: string;
	line: PublicPricingFeatureLine;
};

export function featureLineVisibleForProductLine(
	line: PublicPricingFeatureLine,
	productLine: PublicPricingProductLine
): boolean {
	if (productLine === 'all') return true;
	if (line === 'shared') return true;
	return line === productLine;
}

export function filterCompareRowsByProductLine(
	rows: readonly PublicPricingCompareRowDefinition[],
	productLine: PublicPricingProductLine
): PublicPricingCompareRowDefinition[] {
	return rows.filter((row) => featureLineVisibleForProductLine(row.line, productLine));
}

export function publicPricingCardFeatureLabels(
	definitions: readonly PublicPricingCardFeatureDefinition[],
	productLine: PublicPricingProductLine = 'all'
): string[] {
	return definitions
		.filter((feature) => featureLineVisibleForProductLine(feature.line, productLine))
		.map((feature) => feature.label);
}

export function cardFeatureDefinitionsForLine(
	definitions: readonly PublicPricingCardFeatureDefinition[],
	line: PublicPricingFeatureLine
): readonly PublicPricingCardFeatureDefinition[] {
	return definitions.filter((feature) => feature.line === line);
}
