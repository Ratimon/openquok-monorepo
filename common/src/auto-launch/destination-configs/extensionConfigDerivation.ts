import type { AutoLaunchExtensionConfig } from '../../browser-extension/pageAssist.js';

/** How a provider slug’s extension fixture relates to another shipped slug. */
export type ExtensionConfigDerivation =
	| { kind: 'pricing-queue'; baseProviderSlug: string }
	| { kind: 'independent' };

export type ExtensionConfigDerivationBySlug = Record<string, ExtensionConfigDerivation>;

export function isPricingQueueDerivation(
	entry: ExtensionConfigDerivation
): entry is { kind: 'pricing-queue'; baseProviderSlug: string } {
	return entry.kind === 'pricing-queue';
}

export function pricingQueueDerivations(
	derivations: ExtensionConfigDerivationBySlug
): Record<string, { baseProviderSlug: string }> {
	const out: Record<string, { baseProviderSlug: string }> = {};
	for (const [slug, entry] of Object.entries(derivations)) {
		if (isPricingQueueDerivation(entry)) {
			out[slug] = { baseProviderSlug: entry.baseProviderSlug };
		}
	}
	return out;
}

/** Sync scripts: pricing-queue variants must spread base + `readyUrlHint: 'pricing'`. */
export function validatePricingQueueExtensionFixtures(
	fixtures: Record<string, AutoLaunchExtensionConfig>,
	pricingDerived: Record<string, { baseProviderSlug: string }>
): void {
	for (const [slug, meta] of Object.entries(pricingDerived)) {
		const variant = fixtures[slug];
		const base = fixtures[meta.baseProviderSlug];
		if (!variant || !base) {
			throw new Error(
				`pricing-queue variant ${slug} missing fixture or base ${meta.baseProviderSlug}`
			);
		}
		const expected = { ...base, readyUrlHint: 'pricing' as const };
		if (JSON.stringify(expected) !== JSON.stringify(variant)) {
			throw new Error(
				`${slug} must equal { ...${meta.baseProviderSlug}, readyUrlHint: 'pricing' } in TS fixtures`
			);
		}
	}
}

/** Independent slugs ship full fixtures and must not be pricing-queue derivatives. */
export function validateIndependentExtensionFixtureSlugs(
	fixtures: Record<string, AutoLaunchExtensionConfig>,
	independentSlugs: readonly string[],
	derivations: ExtensionConfigDerivationBySlug
): void {
	for (const slug of independentSlugs) {
		if (!fixtures[slug]) {
			throw new Error(`independent provider ${slug} missing DIRECTORY_EXTENSION_CONFIG_FIXTURES entry`);
		}
		const entry = derivations[slug];
		if (entry?.kind === 'pricing-queue') {
			throw new Error(`independent provider ${slug} must not be a pricing-queue derivative`);
		}
	}
}

export function mergeExtensionConfigDerivations(
	...parts: readonly ExtensionConfigDerivationBySlug[]
): ExtensionConfigDerivationBySlug {
	return Object.assign({}, ...parts);
}